import prisma from '../config/prisma.js';
import { pack, packBest, ALGORITHMS } from '../services/algorithms/index.js';
import { JOB_STATUS } from '../constants/jobStatus.js';

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Job name is required' });
    }

    const job = await prisma.job.create({
      data: {
        name: name.trim(),
        userId
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// Get all jobs for current user
export const getJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get single job by ID
export const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: {
        container: true,
        placements: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Run optimization with algorithm selection
export const runOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { algorithm = 'auto' } = req.body || {};

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

    // 4. Delete any previous placements (re-running optimization)
    await prisma.placement.deleteMany({
      where: { jobId: id }
    });

    // 5. Run the algorithm
    console.log(`⚙️ Running optimization with algorithm: ${algorithm}`);
    const startTime = Date.now();
    
    let result;
    if (algorithm === 'auto') {
      // Run all algorithms and pick best
      result = packBest(job.items, container, job.allowRotation);
    } else {
      // Run specific algorithm
      result = pack(job.items, container, {
        algorithm,
        allowRotation: job.allowRotation,
        generations: 50  // For genetic algorithm
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

    // 7. Update job status and algorithm used
    const finalStatus = result.stats.unplacedCount > 0 ? 'PARTIAL' : 'COMPLETE';
    await prisma.job.update({
      where: { id },
      data: { 
        status: finalStatus,
        algorithm: result.algorithm
      }
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
    
    // Reset status on failure
    await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'READY' }
    }).catch(() => {});

    res.status(500).json({ error: 'Optimization failed' });
  }
};

// Compare all algorithms (for testing/demo)
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

    // Test each algorithm
    for (const algorithm of Object.values(ALGORITHMS)) {
      const startTime = Date.now();
      const result = pack(job.items, container, {
        algorithm,
        allowRotation: job.allowRotation,
        generations: 30
      });
      const elapsed = Date.now() - startTime;

      results.push({
        algorithm: result.algorithm,
        utilization: result.stats.utilization,
        placedCount: result.stats.placedCount,
        unplacedCount: result.stats.unplacedCount,
        elapsed: `${elapsed}ms`
      });
    }

    // Sort by utilization
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