import prisma from '../config/prisma.js';
import { pack, packBest, ALGORITHMS, packGenetic } from '../services/algorithms/index.js';
import { JOB_STATUS } from '../constants/jobStatus.js';

export const runOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { algorithm = 'auto' } = req.body || {};
    const io = req.app.get('io');

    // 1. Get job with items and container
    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: {
        items: true,
        container: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== JOB_STATUS.READY) {
      return res.status(400).json({ error: 'Job must be in READY status. Select a container first.' });
    }

    if (job.items.length === 0) {
      return res.status(400).json({ error: 'No items to pack' });
    }

    // 2. Get container dimensions
    const container = job.container 
      ? { length: job.container.length, width: job.container.width, height: job.container.height }
      : { length: job.customLength, width: job.customWidth, height: job.customHeight };

    // 3. Update status to RUNNING
    await prisma.job.update({
      where: { id },
      data: { status: 'RUNNING' }
    });

    // Notify clients job started
    io.to(`job-${id}`).emit('optimization-started', { jobId: id, algorithm });

    // 4. Delete any previous placements
    await prisma.placement.deleteMany({
      where: { jobId: id }
    });

    // 5. Run the algorithm
    console.log(`⚙️ Running optimization with algorithm: ${algorithm}`);
    const startTime = Date.now();
    
    let result;
    
    // Progress callback for genetic algorithm
    const onProgress = (progress) => {
      io.to(`job-${id}`).emit('optimization-progress', {
        jobId: id,
        ...progress
      });
    };

    if (algorithm === 'genetic') {
      // Run genetic with progress (async)
      result = await packGenetic(job.items, container, job.allowRotation, {
        generations: 50,
        populationSize: 20,
        onProgress
      });
    } else if (algorithm === 'auto') {
      result = packBest(job.items, container, job.allowRotation);
    } else {
      result = pack(job.items, container, {
        algorithm,
        allowRotation: job.allowRotation
      });
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Optimization complete in ${elapsed}ms using ${result.algorithm}`);

    // 6. Save placements to database
    await prisma.placement.createMany({
      data: result.placements.map(p => ({
        jobId: id,
        itemId: p.itemId,
        x: p.x,
        y: p.y,
        z: p.z,
        placedLength: p.placedLength,
        placedWidth: p.placedWidth,
        placedHeight: p.placedHeight,
        rotated: p.rotated,
        placed: p.placed
      }))
    });

    // 7. Update job status
    const finalStatus = result.stats.unplacedCount > 0 ? 'PARTIAL' : 'COMPLETE';
    await prisma.job.update({
      where: { id },
      data: { 
        status: finalStatus,
        algorithm: result.algorithm
      }
    });

    // Notify clients complete
    io.to(`job-${id}`).emit('optimization-complete', {
      jobId: id,
      algorithm: result.algorithm,
      elapsed: `${elapsed}ms`,
      stats: result.stats
    });

    // 8. Return results
    res.json({
      message: 'Optimization complete',
      algorithm: result.algorithm,
      elapsed: `${elapsed}ms`,
      stats: result.stats,
      placements: result.placements
    });

  } catch (error) {
    console.error('Optimization error:', error);
    
    const io = req.app.get('io');
    io.to(`job-${req.params.id}`).emit('optimization-error', {
      jobId: req.params.id,
      error: 'Optimization failed'
    });
    
    await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'READY' }
    }).catch(() => {});

    res.status(500).json({ error: 'Optimization failed' });
  }
};

// Compare all algorithms
export const compareAlgorithms = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: {
        items: true,
        container: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.items.length === 0) {
      return res.status(400).json({ error: 'No items to pack' });
    }

    const container = job.container 
      ? { length: job.container.length, width: job.container.width, height: job.container.height }
      : { length: job.customLength, width: job.customWidth, height: job.customHeight };

    const results = [];

    for (const algorithm of Object.values(ALGORITHMS)) {
      const startTime = Date.now();
      
      let result;
      if (algorithm === 'genetic') {
        // Use await for async genetic
        result = await packGenetic(job.items, container, job.allowRotation, {
          generations: 30
        });
      } else {
        result = pack(job.items, container, {
          algorithm,
          allowRotation: job.allowRotation
        });
      }
      
      const elapsed = Date.now() - startTime;

      results.push({
        algorithm: result.algorithm,
        utilization: result.stats.utilization,
        placedCount: result.stats.placedCount,
        unplacedCount: result.stats.unplacedCount,
        elapsed: `${elapsed}ms`
      });
    }

    results.sort((a, b) => b.utilization - a.utilization);

    res.json({
      jobId: id,
      itemCount: job.items.reduce((sum, i) => sum + i.quantity, 0),
      containerVolume: container.length * container.width * container.height / 1e9,
      results,
      recommended: results[0].algorithm
    });

  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Comparison failed' });
  }
};