import prisma from '../config/prisma.js';

// Get all containers (with optional filters)
export const getContainers = async (req, res) => {
  try {
    const { mode, usage, refrigerated } = req.query;

    // Build filter
    const where = {};
    
    if (mode) {
      where.mode = mode.toUpperCase(); // SEA, AIR, ROAD, RAIL
    }
    
    if (usage) {
      where.usage = usage.toUpperCase(); // MOST_COMMON, COMMON, SPECIALIZED, LAST_MILE
    }
    
    if (refrigerated === 'true') {
      where.isRefrigerated = true;
    }

    const containers = await prisma.container.findMany({
      where,
      orderBy: [
        { usage: 'asc' },  // MOST_COMMON first
        { volume: 'asc' }
      ]
    });

    // Group by mode for easier frontend consumption
    if (req.query.grouped === 'true') {
      const grouped = {
        SEA: containers.filter(c => c.mode === 'SEA'),
        AIR: containers.filter(c => c.mode === 'AIR'),
        ROAD: containers.filter(c => c.mode === 'ROAD'),
        RAIL: containers.filter(c => c.mode === 'RAIL')
      };
      return res.json(grouped);
    }

    res.json(containers);
  } catch (error) {
    console.error('Get containers error:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
};

// Get single container by ID
export const getContainer = async (req, res) => {
  try {
    const { id } = req.params;

    const container = await prisma.container.findUnique({
      where: { id }
    });

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    res.json(container);
  } catch (error) {
    console.error('Get container error:', error);
    res.status(500).json({ error: 'Failed to fetch container' });
  }
};

// Get available transport modes with container counts
export const getTransportModes = async (req, res) => {
  try {
    const modes = await prisma.container.groupBy({
      by: ['mode'],
      _count: { id: true }
    });

    const result = modes.map(m => ({
      mode: m.mode,
      count: m._count.id,
      icon: {
        SEA: '🚢',
        AIR: '✈️',
        ROAD: '🚛',
        RAIL: '🚂'
      }[m.mode],
      label: {
        SEA: 'Sea Freight',
        AIR: 'Air Cargo',
        ROAD: 'Road Transport',
        RAIL: 'Rail Freight'
      }[m.mode]
    }));

    res.json(result);
  } catch (error) {
    console.error('Get transport modes error:', error);
    res.status(500).json({ error: 'Failed to fetch transport modes' });
  }
};

// Update job container selection
export const updateJobContainer = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { 
      containerId,
      transportMode,
      customLength, 
      customWidth, 
      customHeight, 
      customMaxWeight,
      allowRotation 
    } = req.body;

    // Verify job belongs to user
    const existingJob = await prisma.job.findFirst({
      where: { id: jobId, userId }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // If using preset container, verify it exists
    if (containerId) {
      const container = await prisma.container.findUnique({
        where: { id: containerId }
      });
      if (!container) {
        return res.status(400).json({ error: 'Invalid container' });
      }
    }

    // If using custom, validate dimensions
    if (!containerId) {
      if (!customLength || !customWidth || !customHeight) {
        return res.status(400).json({ error: 'Custom dimensions required' });
      }
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        containerId: containerId || null,
        transportMode: transportMode || null,
        customLength: containerId ? null : customLength,
        customWidth: containerId ? null : customWidth,
        customHeight: containerId ? null : customHeight,
        customMaxWeight: containerId ? null : customMaxWeight,
        allowRotation: allowRotation ?? true,
        status: 'READY'
      },
      include: {
        container: true
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Update job container error:', error);
    res.status(500).json({ error: 'Failed to update container' });
  }
};

// Get container recommendation for job
export const getRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.query; // Optional: filter by transport mode
    const userId = req.user.id;

    // Get job with items
    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: { items: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.items.length === 0) {
      return res.json({
        recommended: null,
        reason: 'Add items first to get a recommendation',
        totalVolume: 0
      });
    }

    // Calculate total volume (mm³ → m³)
    const totalVolumeMm3 = job.items.reduce((sum, item) => {
      return sum + (item.length * item.width * item.height * item.quantity);
    }, 0);
    const totalVolumeM3 = totalVolumeMm3 / 1e9;

    // Add 30% buffer for packing inefficiency
    const requiredVolume = totalVolumeM3 * 1.3;

    // Build filter
    const where = {};
    if (mode) {
      where.mode = mode.toUpperCase();
    }

    // Get containers sorted by volume
    const containers = await prisma.container.findMany({
      where,
      orderBy: { volume: 'asc' }
    });

    if (containers.length === 0) {
      return res.json({
        recommended: null,
        reason: `No containers available${mode ? ` for ${mode} transport` : ''}.`,
        totalVolume: totalVolumeM3,
        requiredVolume,
        alternatives: []
      });
    }

    // Find smallest container that fits
    const recommended = containers.find(c => c.volume >= requiredVolume);
    
    // Find alternatives (next sizes up)
    const alternatives = containers
      .filter(c => c.volume > (recommended?.volume || 0))
      .slice(0, 2);

    if (!recommended) {
      const largest = containers[containers.length - 1];
      return res.json({
        recommended: null,
        reason: `Your items total ${totalVolumeM3.toFixed(1)} m³. This exceeds the largest ${mode || ''} container (${largest.name}: ${largest.volume} m³). Consider splitting into multiple shipments.`,
        totalVolume: totalVolumeM3,
        requiredVolume,
        alternatives: []
      });
    }

    const utilization = Math.round((totalVolumeM3 / recommended.volume) * 100);

    res.json({
      recommended,
      reason: `Your items total ${totalVolumeM3.toFixed(1)} m³. With packing buffer, you need ~${requiredVolume.toFixed(1)} m³. ${recommended.name} (${recommended.volume} m³) is the best fit.`,
      totalVolume: totalVolumeM3,
      requiredVolume,
      utilization,
      alternatives
    });
  } catch (error) {
    console.error('Get recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
};