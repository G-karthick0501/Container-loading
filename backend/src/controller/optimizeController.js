import prisma from '../config/prisma.js';
import { pack, packBest, ALGORITHMS, packGenetic } from '../services/algorithms/index.js';
import { JOB_STATUS } from '../constants/jobStatus.js';
import { getRecommendedAlgorithm } from '../services/mlService.js';

export const runOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    let { algorithm = 'auto' } = req.body || {};
    const io = req.app.get('io');

    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: { items: true, container: true }
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== JOB_STATUS.READY) {
      return res.status(400).json({ error: 'Job must be in READY status' });
    }
    if (job.items.length === 0) {
      return res.status(400).json({ error: 'No items to pack' });
    }

    const container = job.container 
      ? { length: job.container.length, width: job.container.width, height: job.container.height }
      : { length: job.customLength, width: job.customWidth, height: job.customHeight };

    // ML auto-select
    let mlRecommendation = null;
    if (algorithm === 'auto') {
      mlRecommendation = await getRecommendedAlgorithm(job.items, container);
      algorithm = mlRecommendation.algorithm;
      console.log(`🤖 ML recommended: ${algorithm} (${(mlRecommendation.confidence * 100).toFixed(0)}%)`);
    }

    await prisma.job.update({ where: { id }, data: { status: 'RUNNING' } });
    io.to(`job-${id}`).emit('optimization-started', { jobId: id, algorithm, mlRecommendation });

    await prisma.placement.deleteMany({ where: { jobId: id } });

    console.log(`⚙️ Running optimization with algorithm: ${algorithm}`);
    const startTime = Date.now();
    
    let result;
    const onProgress = (progress) => {
      io.to(`job-${id}`).emit('optimization-progress', { jobId: id, ...progress });
    };

    if (algorithm === 'genetic') {
      result = await packGenetic(job.items, container, job.allowRotation, {
        generations: 50, populationSize: 20, onProgress
      });
    } else {
      result = pack(job.items, container, { algorithm, allowRotation: job.allowRotation });
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Optimization complete in ${elapsed}ms using ${result.algorithm}`);

    await prisma.placement.createMany({
      data: result.placements.map(p => ({
        jobId: id, itemId: p.itemId,
        x: p.x, y: p.y, z: p.z,
        placedLength: p.placedLength, placedWidth: p.placedWidth, placedHeight: p.placedHeight,
        rotated: p.rotated, placed: p.placed
      }))
    });

    const finalStatus = result.stats.unplacedCount > 0 ? 'PARTIAL' : 'COMPLETE';
    await prisma.job.update({ where: { id }, data: { status: finalStatus, algorithm: result.algorithm } });

    io.to(`job-${id}`).emit('optimization-complete', {
      jobId: id, algorithm: result.algorithm, elapsed: `${elapsed}ms`, stats: result.stats, mlRecommendation
    });

    res.json({
      message: 'Optimization complete',
      algorithm: result.algorithm,
      elapsed: `${elapsed}ms`,
      stats: result.stats,
      placements: result.placements,
      mlRecommendation
    });

  } catch (error) {
    console.error('Optimization error:', error);
    const io = req.app.get('io');
    io.to(`job-${req.params.id}`).emit('optimization-error', { jobId: req.params.id, error: 'Optimization failed' });
    await prisma.job.update({ where: { id: req.params.id }, data: { status: 'READY' } }).catch(() => {});
    res.status(500).json({ error: 'Optimization failed' });
  }
};

export const compareAlgorithms = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: { items: true, container: true }
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.items.length === 0) return res.status(400).json({ error: 'No items to pack' });

    const container = job.container 
      ? { length: job.container.length, width: job.container.width, height: job.container.height }
      : { length: job.customLength, width: job.customWidth, height: job.customHeight };

    const mlRecommendation = await getRecommendedAlgorithm(job.items, container);
    const results = [];

    for (const algorithm of Object.values(ALGORITHMS)) {
      const startTime = Date.now();
      let result;
      if (algorithm === 'genetic') {
        result = await packGenetic(job.items, container, job.allowRotation, { generations: 30 });
      } else {
        result = pack(job.items, container, { algorithm, allowRotation: job.allowRotation });
      }
      const elapsed = Date.now() - startTime;

      results.push({
        algorithm: result.algorithm,
        utilization: result.stats.utilization,
        placedCount: result.stats.placedCount,
        unplacedCount: result.stats.unplacedCount,
        elapsed: `${elapsed}ms`,
        mlRecommended: result.algorithm === mlRecommendation.algorithm
      });
    }

    results.sort((a, b) => b.utilization - a.utilization);

    res.json({
      jobId: id,
      itemCount: job.items.reduce((sum, i) => sum + i.quantity, 0),
      results,
      recommended: results[0].algorithm,
      mlRecommendation
    });

  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Comparison failed' });
  }
};