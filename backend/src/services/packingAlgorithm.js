/**
 * 3D Bin Packing - First Fit Decreasing
 */

function boxesOverlap(box1, box2) {
  const overlapX = box1.x < box2.x + box2.length && box1.x + box1.length > box2.x;
  const overlapY = box1.y < box2.y + box2.width && box1.y + box1.width > box2.y;
  const overlapZ = box1.z < box2.z + box2.height && box1.z + box1.height > box2.z;
  
  return overlapX && overlapY && overlapZ;
}

function canPlace(item, x, y, z, container, placedBoxes) {
  if (x + item.length > container.length) return false;
  if (y + item.width > container.width) return false;
  if (z + item.height > container.height) return false;
  
  const newBox = { x, y, z, length: item.length, width: item.width, height: item.height };
  
  for (const placed of placedBoxes) {
    if (boxesOverlap(newBox, placed)) {
      return false;
    }
  }
  
  return true;
}

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
  // Try original orientation
  const original = findPosition(item, container, placedBoxes, step);
  if (original) {
    return { ...original, length: item.length, width: item.width, height: item.height, rotated: false };
  }
  
  if (!allowRotation) return null;
  
  // Try rotations
  const rotations = [
    { length: item.width, width: item.length, height: item.height },
    { length: item.length, width: item.height, height: item.width },
    { length: item.height, width: item.width, height: item.length },
  ];
  
  for (const rotated of rotations) {
    const rotatedItem = { ...item, ...rotated };
    const position = findPosition(rotatedItem, container, placedBoxes, step);
    if (position) {
      return { ...position, ...rotated, rotated: true };
    }
  }
  
  return null;
}

export function packItems(items, container, allowRotation = true, step = 50) {
  // 1. Expand by quantity
  const expandedItems = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expandedItems.push({ ...item, instanceIndex: i });
    }
  }
  
  // 2. Sort by volume (largest first)
  expandedItems.sort((a, b) => {
    return (b.length * b.width * b.height) - (a.length * a.width * a.height);
  });
  
  // 3. Place each item
  const placedBoxes = [];
  const placements = [];
  let placedCount = 0;
  let unplacedCount = 0;
  let placedVolume = 0;
  
  for (const item of expandedItems) {
    const position = findPositionWithRotation(item, container, placedBoxes, allowRotation, step);
    
    if (position) {
      placedBoxes.push({
        x: position.x, y: position.y, z: position.z,
        length: position.length, width: position.width, height: position.height
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
      
      placedCount++;
      placedVolume += position.length * position.width * position.height;
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
      unplacedCount++;
    }
  }
  
  // 4. Calculate stats
  const containerVolume = container.length * container.width * container.height;
  const utilization = (placedVolume / containerVolume) * 100;
  
  return {
    placements,
    stats: {
      totalItems: expandedItems.length,
      placedCount,
      unplacedCount,
      placedVolume: placedVolume / 1e9,
      containerVolume: containerVolume / 1e9,
      utilization: Math.round(utilization * 10) / 10
    }
  };
}