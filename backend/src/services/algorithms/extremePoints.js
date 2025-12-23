/**
 * Extreme Points Algorithm
 * 
 * More efficient than grid scanning - only checks "extreme points"
 * which are corners created by already-placed boxes.
 * 
 * Typically achieves 5-15% better utilization than FFD.
 */

import { canPlace, getRotations, expandItems, volume, calculateStats } from './utils.js';

// Generate new extreme points when placing a box
function generateExtremePoints(box, container, existingPoints, placedBoxes) {
  const newPoints = [
    { x: box.x + box.length, y: box.y, z: box.z },           // Right
    { x: box.x, y: box.y + box.width, z: box.z },            // Behind
    { x: box.x, y: box.y, z: box.z + box.height },           // Top
    { x: box.x + box.length, y: box.y + box.width, z: box.z }, // Right-behind corner
    { x: box.x + box.length, y: box.y, z: box.z + box.height }, // Right-top corner
    { x: box.x, y: box.y + box.width, z: box.z + box.height }   // Behind-top corner
  ];
  
  // Filter: within bounds and not inside any placed box
  return newPoints.filter(point => {
    // Must be within container
    if (point.x >= container.length || point.y >= container.width || point.z >= container.height) {
      return false;
    }
    
    // Must not be inside any placed box
    for (const placed of placedBoxes) {
      if (
        point.x >= placed.x && point.x < placed.x + placed.length &&
        point.y >= placed.y && point.y < placed.y + placed.width &&
        point.z >= placed.z && point.z < placed.z + placed.height
      ) {
        return false;
      }
    }
    
    return true;
  });
}

// Remove points that are now inside placed boxes
function filterValidPoints(points, placedBoxes) {
  return points.filter(point => {
    for (const placed of placedBoxes) {
      if (
        point.x >= placed.x && point.x < placed.x + placed.length &&
        point.y >= placed.y && point.y < placed.y + placed.width &&
        point.z >= placed.z && point.z < placed.z + placed.height
      ) {
        return false;
      }
    }
    return true;
  });
}

// Score a placement (lower is better - prefer bottom-left-back)
function scorePlacement(x, y, z) {
  return z * 1000000 + y * 1000 + x; // Prioritize: low Z, then low Y, then low X
}

// Find best position for item using extreme points
function findBestPosition(item, container, placedBoxes, extremePoints, allowRotation) {
  let bestPlacement = null;
  let bestScore = Infinity;
  
  const rotations = allowRotation ? getRotations(item) : [{ length: item.length, width: item.width, height: item.height }];
  
  for (const point of extremePoints) {
    for (const rotation of rotations) {
      const rotatedItem = { ...item, ...rotation };
      
      if (canPlace(rotatedItem, point.x, point.y, point.z, container, placedBoxes)) {
        const score = scorePlacement(point.x, point.y, point.z);
        
        if (score < bestScore) {
          bestScore = score;
          bestPlacement = {
            x: point.x,
            y: point.y,
            z: point.z,
            length: rotation.length,
            width: rotation.width,
            height: rotation.height,
            rotated: rotation.length !== item.length || rotation.width !== item.width || rotation.height !== item.height
          };
        }
      }
    }
  }
  
  return bestPlacement;
}

export function packExtremePoints(items, container, allowRotation = true) {
  // Expand and sort by volume (largest first)
  const expandedItems = expandItems(items);
  expandedItems.sort((a, b) => volume(b) - volume(a));
  
  const placedBoxes = [];
  const placements = [];
  
  // Start with origin as the only extreme point
  let extremePoints = [{ x: 0, y: 0, z: 0 }];
  
  for (const item of expandedItems) {
    const position = findBestPosition(item, container, placedBoxes, extremePoints, allowRotation);
    
    if (position) {
      const box = {
        x: position.x,
        y: position.y,
        z: position.z,
        length: position.length,
        width: position.width,
        height: position.height
      };
      
      placedBoxes.push(box);
      
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
      
      // Generate new extreme points and filter invalid ones
      const newPoints = generateExtremePoints(box, container, extremePoints, placedBoxes);
      extremePoints = filterValidPoints([...extremePoints, ...newPoints], placedBoxes);
      
      // Remove duplicates
      const uniquePoints = [];
      const seen = new Set();
      for (const p of extremePoints) {
        const key = `${p.x}-${p.y}-${p.z}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniquePoints.push(p);
        }
      }
      extremePoints = uniquePoints;
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
    algorithm: 'extreme-points'
  };
}