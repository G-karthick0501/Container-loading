import prisma from '../config/prisma.js';
import { packItems } from '../services/packingAlgorithm.js';

export const runOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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

    if (job.status !== 'READY') {
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
    const { placements, stats } = packItems(job.items, container, job.allowRotation);

    // 6. Save placements to database
    await prisma.placement.createMany({
      data: placements.map(p => ({
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
    const finalStatus = stats.unplacedCount > 0 ? 'COMPLETE' : 'COMPLETE';
    await prisma.job.update({
      where: { id },
      data: { status: finalStatus }
    });

    // 8. Return results
    res.json({
      message: 'Optimization complete',
      stats,
      placements
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