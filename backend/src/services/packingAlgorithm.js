/**
 * 3D Bin-Packing Algorithm
 * Uses a greedy "first-fit decreasing" heuristic with layer-by-layer placement
 */

/**
 * Main packing function - places items into a container
 * @param {Array} items - Items with id, name, length, width, height, weight, quantity
 * @param {Object} container - Container with length, width, height, maxWeight
 * @param {boolean} allowRotation - Whether items can be rotated
 * @returns {Object} - Placement results and statistics
 */
export function packItems(items, container, allowRotation = true) {
  // STEP 1: Expand items by quantity and calculate volumes
  const expandedItems = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expandedItems.push({
        ...item,
        instanceIndex: i,
        volume: item.length * item.width * item.height
      });
    }
  }

  // STEP 2: Sort by volume (largest first - greedy heuristic)
  expandedItems.sort((a, b) => b.volume - a.volume);

  // STEP 3: Track placed boxes and results
  const placedBoxes = [];
  const placements = [];
  let totalPlacedVolume = 0;
  let totalPlacedWeight = 0;

  // STEP 4: Try to place each item
  for (const item of expandedItems) {
    const position = findPosition(item, container, placedBoxes, allowRotation);

    if (position) {
      // Check weight constraint
      if (totalPlacedWeight + item.weight <= container.maxWeight) {
        const placement = {
          itemId: item.id,
          itemName: item.name,
          instanceIndex: item.instanceIndex,
          x: position.x,
          y: position.y,
          z: position.z,
          placedLength: position.placedLength,
          placedWidth: position.placedWidth,
          placedHeight: position.placedHeight,
          rotated: position.rotated,
          placed: true
        };

        placements.push(placement);
        placedBoxes.push({
          x: position.x,
          y: position.y,
          z: position.z,
          length: position.placedLength,
          width: position.placedWidth,
          height: position.placedHeight
        });

        totalPlacedVolume += item.volume;
        totalPlacedWeight += item.weight;
      } else {
        // Weight limit exceeded
        placements.push({
          itemId: item.id,
          itemName: item.name,
          instanceIndex: item.instanceIndex,
          x: 0,
          y: 0,
          z: 0,
          placedLength: item.length,
          placedWidth: item.width,
          placedHeight: item.height,
          rotated: false,
          placed: false,
          reason: 'Weight limit exceeded'
        });
      }
    } else {
      // No position found
      placements.push({
        itemId: item.id,
        itemName: item.name,
        instanceIndex: item.instanceIndex,
        x: 0,
        y: 0,
        z: 0,
        placedLength: item.length,
        placedWidth: item.width,
        placedHeight: item.height,
        rotated: false,
        placed: false,
        reason: 'No space available'
      });
    }
  }

  // STEP 5: Calculate statistics
  const containerVolume = container.length * container.width * container.height;
  const placedCount = placements.filter(p => p.placed).length;
  const unplacedCount = placements.filter(p => !p.placed).length;

  return {
    placements,
    statistics: {
      totalItems: expandedItems.length,
      placedCount,
      unplacedCount,
      volumeUtilization: Math.round((totalPlacedVolume / containerVolume) * 100),
      weightUtilization: Math.round((totalPlacedWeight / container.maxWeight) * 100),
      totalPlacedVolume,
      totalPlacedWeight,
      containerVolume,
      containerMaxWeight: container.maxWeight
    }
  };
}

/**
 * Find a valid position for an item using layer-by-layer approach
 * @param {Object} item - Item to place
 * @param {Object} container - Container dimensions
 * @param {Array} placedBoxes - Already placed boxes
 * @param {boolean} allowRotation - Whether rotation is allowed
 * @returns {Object|null} - Position and dimensions, or null if not found
 */
function findPosition(item, container, placedBoxes, allowRotation) {
  // Get all possible orientations
  const orientations = getOrientations(item, allowRotation);

  // Step size for position search (smaller = more precise but slower)
  const step = 10; // 10mm steps

  // Try each orientation
  for (const orientation of orientations) {
    const { length, width, height, rotated } = orientation;

    // Layer-by-layer: fill the bottom plane first, then go up
    for (let z = 0; z <= container.height - height; z += step) {
      for (let y = 0; y <= container.width - width; y += step) {
        for (let x = 0; x <= container.length - length; x += step) {
          if (canPlace(x, y, z, length, width, height, container, placedBoxes)) {
            return {
              x,
              y,
              z,
              placedLength: length,
              placedWidth: width,
              placedHeight: height,
              rotated
            };
          }
        }
      }
    }
  }

  return null; // No valid position found
}

/**
 * Get all valid orientations for an item
 * @param {Object} item - Item with length, width, height
 * @param {boolean} allowRotation - Whether rotation is allowed
 * @returns {Array} - Array of orientation objects
 */
function getOrientations(item, allowRotation) {
  const { length, width, height } = item;

  if (!allowRotation) {
    return [{ length, width, height, rotated: false }];
  }

  // All 6 possible orientations (consider 3 if we keep height as vertical)
  // For practical packing, we usually only rotate in the horizontal plane
  const orientations = [
    { length, width, height, rotated: false },
    { length: width, width: length, height, rotated: true },
  ];

  // Remove duplicates (when dimensions are equal)
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

/**
 * Check if an item can be placed at a specific position
 * @param {number} x, y, z - Position coordinates
 * @param {number} length, width, height - Item dimensions at this orientation
 * @param {Object} container - Container dimensions
 * @param {Array} placedBoxes - Already placed boxes
 * @returns {boolean} - Whether placement is valid
 */
function canPlace(x, y, z, length, width, height, container, placedBoxes) {
  // Check 1: Item fits within container bounds
  if (x + length > container.length) return false;
  if (y + width > container.width) return false;
  if (z + height > container.height) return false;

  // Check 2: No collision with already placed boxes
  for (const box of placedBoxes) {
    if (boxesOverlap(
      x, y, z, length, width, height,
      box.x, box.y, box.z, box.length, box.width, box.height
    )) {
      return false;
    }
  }

  return true;
}

/**
 * Check if two 3D boxes overlap
 * @returns {boolean} - True if boxes overlap
 */
function boxesOverlap(x1, y1, z1, l1, w1, h1, x2, y2, z2, l2, w2, h2) {
  // Two boxes overlap if they overlap in all three dimensions
  const overlapX = x1 < x2 + l2 && x1 + l1 > x2;
  const overlapY = y1 < y2 + w2 && y1 + w1 > y2;
  const overlapZ = z1 < z2 + h2 && z1 + h1 > z2;

  return overlapX && overlapY && overlapZ;
}

export default packItems;
