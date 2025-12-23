/**
 * Genetic Algorithm for 3D Bin Packing
 * 
 * Evolves the ORDER in which items are placed.
 * Uses Extreme Points for actual placement.
 */

import { canPlace, getRotations, expandItems, volume, calculateStats } from './utils.js';

// Small delay to allow event loop to process
const tick = () => new Promise(resolve => setImmediate(resolve));

// Place items in given order using extreme points logic
function placeInOrder(orderedItems, container, allowRotation) {
  const placedBoxes = [];
  const placements = [];
  let extremePoints = [{ x: 0, y: 0, z: 0 }];
  
  for (const item of orderedItems) {
    let bestPlacement = null;
    let bestScore = Infinity;
    
    const rotations = allowRotation 
      ? getRotations(item) 
      : [{ length: item.length, width: item.width, height: item.height }];
    
    for (const point of extremePoints) {
      for (const rotation of rotations) {
        const rotatedItem = { ...item, ...rotation };
        
        if (canPlace(rotatedItem, point.x, point.y, point.z, container, placedBoxes)) {
          const score = point.z * 1000000 + point.y * 1000 + point.x;
          
          if (score < bestScore) {
            bestScore = score;
            bestPlacement = {
              x: point.x,
              y: point.y,
              z: point.z,
              ...rotation,
              rotated: rotation.length !== item.length || rotation.width !== item.width
            };
          }
        }
      }
    }
    
    if (bestPlacement) {
      const box = {
        x: bestPlacement.x,
        y: bestPlacement.y,
        z: bestPlacement.z,
        length: bestPlacement.length,
        width: bestPlacement.width,
        height: bestPlacement.height
      };
      
      placedBoxes.push(box);
      placements.push({ 
        ...bestPlacement, 
        itemId: item.id, 
        placed: true,
        placedLength: bestPlacement.length,
        placedWidth: bestPlacement.width,
        placedHeight: bestPlacement.height
      });
      
      const newPoints = [
        { x: box.x + box.length, y: box.y, z: box.z },
        { x: box.x, y: box.y + box.width, z: box.z },
        { x: box.x, y: box.y, z: box.z + box.height }
      ].filter(p => 
        p.x < container.length && p.y < container.width && p.z < container.height
      );
      
      extremePoints = [...extremePoints, ...newPoints].filter(point => {
        for (const placed of placedBoxes) {
          if (
            point.x >= placed.x && point.x < placed.x + placed.length &&
            point.y >= placed.y && point.y < placed.y + placed.width &&
            point.z >= placed.z && point.z < placed.z + placed.height
          ) return false;
        }
        return true;
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
  
  return placements;
}

function fitness(placements, container) {
  const placedVolume = placements
    .filter(p => p.placed)
    .reduce((sum, p) => sum + p.placedLength * p.placedWidth * p.placedHeight, 0);
  
  const placedCount = placements.filter(p => p.placed).length;
  const totalCount = placements.length;
  
  const containerVolume = container.length * container.width * container.height;
  const volumeScore = placedVolume / containerVolume;
  const placementBonus = placedCount === totalCount ? 0.1 : 0;
  
  return volumeScore + placementBonus;
}

function createInitialPopulation(items, popSize) {
  const population = [];
  
  const byVolume = [...items].sort((a, b) => volume(b) - volume(a));
  population.push(byVolume);
  
  const byHeight = [...items].sort((a, b) => b.height - a.height);
  population.push(byHeight);
  
  const byArea = [...items].sort((a, b) => (b.length * b.width) - (a.length * a.width));
  population.push(byArea);
  
  const byLongest = [...items].sort((a, b) => 
    Math.max(b.length, b.width, b.height) - Math.max(a.length, a.width, a.height)
  );
  population.push(byLongest);
  
  while (population.length < popSize) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    population.push(shuffled);
  }
  
  return population;
}

function crossover(parent1, parent2) {
  const size = parent1.length;
  const start = Math.floor(Math.random() * size);
  const end = start + Math.floor(Math.random() * (size - start));
  
  const child = new Array(size).fill(null);
  
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }
  
  let childIndex = (end + 1) % size;
  for (let i = 0; i < size; i++) {
    const parent2Index = (end + 1 + i) % size;
    const item = parent2[parent2Index];
    
    if (!child.some(c => c && c.id === item.id && c.instanceIndex === item.instanceIndex)) {
      child[childIndex] = item;
      childIndex = (childIndex + 1) % size;
    }
  }
  
  return child;
}

function mutate(individual, mutationRate = 0.1) {
  if (Math.random() > mutationRate) return individual;
  
  const mutated = [...individual];
  const i = Math.floor(Math.random() * mutated.length);
  const j = Math.floor(Math.random() * mutated.length);
  [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
  
  return mutated;
}

function select(population, fitnesses, tournamentSize = 3) {
  const tournament = [];
  for (let i = 0; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    tournament.push({ individual: population[idx], fitness: fitnesses[idx] });
  }
  tournament.sort((a, b) => b.fitness - a.fitness);
  return tournament[0].individual;
}

// ASYNC version with progress updates
export async function packGenetic(items, container, allowRotation = true, options = {}) {
  const {
    populationSize = 20,
    generations = 50,
    mutationRate = 0.15,
    eliteCount = 2,
    onProgress = null
  } = options;
  
  const expandedItems = expandItems(items);
  
  if (expandedItems.length === 0) {
    return {
      placements: [],
      stats: calculateStats([], container),
      algorithm: 'genetic'
    };
  }
  
  let population = createInitialPopulation(expandedItems, populationSize);
  let bestEver = null;
  let bestFitnessEver = -1;
  
  for (let gen = 0; gen < generations; gen++) {
    const fitnesses = population.map(individual => {
      const placements = placeInOrder(individual, container, allowRotation);
      return fitness(placements, container);
    });
    
    const maxFitness = Math.max(...fitnesses);
    const maxIndex = fitnesses.indexOf(maxFitness);
    
    if (maxFitness > bestFitnessEver) {
      bestFitnessEver = maxFitness;
      bestEver = population[maxIndex];
    }
    
    // Report progress and yield to event loop
    if (onProgress) {
      onProgress({
        generation: gen + 1,
        totalGenerations: generations,
        progress: Math.round(((gen + 1) / generations) * 100),
        bestFitness: Math.round(bestFitnessEver * 1000) / 10,
        currentBest: Math.round(maxFitness * 1000) / 10
      });
      
      // Yield to event loop every generation to send WebSocket messages
      await tick();
    }
    
    const nextGen = [];
    
    const sortedIndices = fitnesses
      .map((f, i) => ({ f, i }))
      .sort((a, b) => b.f - a.f)
      .map(x => x.i);
    
    for (let i = 0; i < eliteCount && i < sortedIndices.length; i++) {
      nextGen.push(population[sortedIndices[i]]);
    }
    
    while (nextGen.length < populationSize) {
      const parent1 = select(population, fitnesses);
      const parent2 = select(population, fitnesses);
      let child = crossover(parent1, parent2);
      child = mutate(child, mutationRate);
      nextGen.push(child);
    }
    
    population = nextGen;
  }
  
  const finalPlacements = placeInOrder(bestEver, container, allowRotation);
  
  return {
    placements: finalPlacements,
    stats: calculateStats(finalPlacements, container),
    algorithm: 'genetic',
    generations
  };
}