import prisma from '../config/prisma.js';
import { packItems } from '../services/packingAlgorithm.js';

/**
 * Run 3D bin-packing optimization for a job
 * POST /api/jobs/:id/optimize
 */
export const runOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get job with items and container
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

    if (job.status !== 'READY') {
      return res.status(400).json({
        error: 'Job must be in READY status to optimize. Please select a container first.'
      });
    }

    if (job.items.length === 0) {
      return res.status(400).json({ error: 'No items to optimize' });
    }

    // Determine container dimensions (preset or custom)
    const container = job.container
      ? {
          length: job.container.length,
          width: job.container.width,
          height: job.container.height,
          maxWeight: job.container.maxWeight
        }
      : {
          length: job.customLength,
          width: job.customWidth,
          height: job.customHeight,
          maxWeight: job.customMaxWeight || 999999 // No weight limit if not specified
        };

    // Update job status to RUNNING
    await prisma.job.update({
      where: { id },
      data: { status: 'RUNNING' }
    });

    // Run the packing algorithm
    const result = packItems(job.items, container, job.allowRotation);

    // Delete any existing placements for this job
    await prisma.placement.deleteMany({
      where: { jobId: id }
    });

    // Save placements to database
    const placementsToCreate = result.placements.map(p => ({
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
    }));

    await prisma.placement.createMany({
      data: placementsToCreate
    });

    // Update job status based on results
    const finalStatus = result.statistics.unplacedCount > 0 ? 'FAILED' : 'COMPLETE';

    await prisma.job.update({
      where: { id },
      data: { status: finalStatus }
    });

    // Fetch the saved placements with item details
    const savedPlacements = await prisma.placement.findMany({
      where: { jobId: id },
      include: { item: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      status: finalStatus,
      placements: savedPlacements,
      statistics: result.statistics,
      container: {
        name: job.container?.name || 'Custom Container',
        ...container
      }
    });

  } catch (error) {
    console.error('Optimization error:', error);

    // Try to reset job status on error
    try {
      await prisma.job.update({
        where: { id: req.params.id },
        data: { status: 'READY' }
      });
    } catch (e) {
      // Ignore reset errors
    }

    res.status(500).json({ error: 'Optimization failed: ' + error.message });
  }
};

/**
 * Get optimization results for a job
 * GET /api/jobs/:id/results
 */
export const getResults = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: { container: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get placements
    const placements = await prisma.placement.findMany({
      where: { jobId: id },
      include: { item: true },
      orderBy: { createdAt: 'asc' }
    });

    if (placements.length === 0) {
      return res.json({
        hasResults: false,
        message: 'No optimization results yet. Run optimization first.'
      });
    }

    // Calculate statistics
    const placedCount = placements.filter(p => p.placed).length;
    const unplacedCount = placements.filter(p => !p.placed).length;

    const container = job.container || {
      length: job.customLength,
      width: job.customWidth,
      height: job.customHeight,
      maxWeight: job.customMaxWeight
    };

    const containerVolume = container.length * container.width * container.height;
    const placedVolume = placements
      .filter(p => p.placed)
      .reduce((sum, p) => sum + (p.placedLength * p.placedWidth * p.placedHeight), 0);

    res.json({
      hasResults: true,
      status: job.status,
      placements,
      statistics: {
        totalItems: placements.length,
        placedCount,
        unplacedCount,
        volumeUtilization: Math.round((placedVolume / containerVolume) * 100),
        containerVolume,
        placedVolume
      },
      container: {
        name: job.container?.name || 'Custom Container',
        ...container
      }
    });

  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
};

/**
 * Reset optimization (clear placements, set status back to READY)
 * POST /api/jobs/:id/reset
 */
export const resetOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id, userId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete placements
    await prisma.placement.deleteMany({
      where: { jobId: id }
    });

    // Reset status to READY (if container is selected) or DRAFT
    const newStatus = job.containerId || job.customLength ? 'READY' : 'DRAFT';

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: newStatus },
      include: { container: true, items: true }
    });

    res.json({
      success: true,
      message: 'Optimization reset successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset optimization' });
  }
};
