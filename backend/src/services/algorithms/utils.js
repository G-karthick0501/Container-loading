/**
 * Shared utilities for all packing algorithms
 */

// Check if two 3D boxes overlap
export function boxesOverlap(box1, box2) {
  return (
    box1.x < box2.x + box2.length && box1.x + box1.length > box2.x &&
    box1.y < box2.y + box2.width && box1.y + box1.width > box2.y &&
    box1.z < box2.z + box2.height && box1.z + box1.height > box2.z
  );
}

// Check if item fits at position without overlapping
export function canPlace(item, x, y, z, container, placedBoxes) {
  // Boundary check
  if (x + item.length > container.length) return false;
  if (y + item.width > container.width) return false;
  if (z + item.height > container.height) return false;
  
  const newBox = { x, y, z, length: item.length, width: item.width, height: item.height };
  
  // Collision check
  for (const placed of placedBoxes) {
    if (boxesOverlap(newBox, placed)) {
      return false;
    }
  }
  
  return true;
}

// Get all rotations of an item (6 orientations)
export function getRotations(item) {
  const { length: l, width: w, height: h } = item;
  
  // All 6 unique orientations
  const orientations = [
    { length: l, width: w, height: h },
    { length: l, width: h, height: w },
    { length: w, width: l, height: h },
    { length: w, width: h, height: l },
    { length: h, width: l, height: w },
    { length: h, width: w, height: l }
  ];
  
  // Remove duplicates (for cubic items)
  const unique = [];
  const seen = new Set();
  
  for (const o of orientations) {
    const key = `${o.length}-${o.width}-${o.height}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(o);
    }
  }
  
  return unique;
}

// Expand items by quantity
export function expandItems(items) {
  const expanded = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expanded.push({ ...item, instanceIndex: i });
    }
  }
  return expanded;
}

// Calculate volume
export function volume(item) {
  return item.length * item.width * item.height;
}

// Calculate packing statistics
export function calculateStats(placements, container) {
  const placedPlacements = placements.filter(p => p.placed);
  const placedVolume = placedPlacements.reduce((sum, p) => {
    return sum + (p.placedLength * p.placedWidth * p.placedHeight);
  }, 0);
  
  const containerVolume = container.length * container.width * container.height;
  const utilization = (placedVolume / containerVolume) * 100;
  
  return {
    totalItems: placements.length,
    placedCount: placedPlacements.length,
    unplacedCount: placements.length - placedPlacements.length,
    placedVolume: placedVolume / 1e9,
    containerVolume: containerVolume / 1e9,
    utilization: Math.round(utilization * 10) / 10
  };
}