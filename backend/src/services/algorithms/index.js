/**
 * Unified Packing Interface
 */

import { packFFD } from './ffd.js';
import { packExtremePoints } from './extremePoints.js';
import { packGenetic } from './genetic.js';

export const ALGORITHMS = {
  FFD: 'ffd',
  EXTREME_POINTS: 'extreme-points',
  GENETIC: 'genetic'
};

export function pack(items, container, options = {}) {
  const { 
    algorithm = ALGORITHMS.EXTREME_POINTS,
    allowRotation = true,
    ...algorithmOptions 
  } = options;
  
  switch (algorithm) {
    case ALGORITHMS.FFD:
      return packFFD(items, container, allowRotation, algorithmOptions.step);
    
    case ALGORITHMS.EXTREME_POINTS:
      return packExtremePoints(items, container, allowRotation);
    
    case ALGORITHMS.GENETIC:
      return packGenetic(items, container, allowRotation, algorithmOptions);
    
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}

export function packBest(items, container, allowRotation = true) {
  const results = [
    packFFD(items, container, allowRotation),
    packExtremePoints(items, container, allowRotation),
    packGenetic(items, container, allowRotation, { generations: 30 })
  ];
  
  return results.reduce((best, current) => 
    current.stats.utilization > best.stats.utilization ? current : best
  );
}

export { packFFD, packExtremePoints, packGenetic };