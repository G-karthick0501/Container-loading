/**
 * First Fit Decreasing (FFD) Algorithm
 * 
 * Simple grid-scanning approach. Fast but less efficient.
 * Good baseline for comparison.
 */

import { canPlace, getRotations, expandItems, calculateStats } from './utils.js';

function findPosition(item, container, placedBoxes, step = 50) {
  for (let z = 0; z <= container.height - item.height; z += step) {
    for (let y = 0; y <= container.width - item.width; y += step) {
      for (let x = 0; x <= container.length - item.length; x += step) {
        if (canPlace(item, x, y, z, container, placedBoxes)) {
          return { x, y, z };
        }
      }
    }
  }
  return null;
}

function findPositionWithRotation(item, container, placedBoxes, allowRotation, step) {
  const rotations = allowRotation 
    ? getRotations(item) 
    : [{ length: item.length, width: item.width, height: item.height }];
  
  for (const rotation of rotations) {
    const rotatedItem = { ...item, ...rotation };
    const position = findPosition(rotatedItem, container, placedBoxes, step);
    
    if (position) {
      return {
        ...position,
        length: rotation.length,
        width: rotation.width,
        height: rotation.height,
        rotated: rotation.length !== item.length || rotation.width !== item.width
      };
    }
  }
  
  return null;
}

export function packFFD(items, container, allowRotation = true, step = 50) {
  // Expand and sort by volume (largest first)
  const expandedItems = expandItems(items);
  expandedItems.sort((a, b) => 
    (b.length * b.width * b.height) - (a.length * a.width * a.height)
  );
  
  const placedBoxes = [];
  const placements = [];
  
  for (const item of expandedItems) {
    const position = findPositionWithRotation(item, container, placedBoxes, allowRotation, step);
    
    if (position) {
      placedBoxes.push({
        x: position.x,
        y: position.y,
        z: position.z,
        length: position.length,
        width: position.width,
        height: position.height
      });
      
      placements.push({
        itemId: item.id,
        x: position.x,
        y: position.y,
        z: position.z,
        placedLength: position.length,
        placedWidth: position.width,
        placedHeight: position.height,
        rotated: position.rotated,
        placed: true
      });
    } else {
      placements.push({
        itemId: item.id,
        x: 0, y: 0, z: 0,
        placedLength: item.length,
        placedWidth: item.width,
        placedHeight: item.height,
        rotated: false,
        placed: false
      });
    }
  }
  
  return {
    placements,
    stats: calculateStats(placements, container),
    algorithm: 'ffd'
  };
}