import prisma from '../config/prisma.js';
import fs from 'fs';
import csv from 'csv-parser';

// Create a new item for a job
export const createItem = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { name, length, width, height, weight, quantity } = req.body;

    // 1. Verify job exists and belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // 2. Validate required fields
    // TODO: Add validation logic here
    if (!name || !length || !width || !height || !weight) {
      return res.status(400).json({ error: 'Missing required item fields' });
    }

    // 3. Create the item
    const item = await prisma.item.create({
      data: {
        name,
        length,
        width,
        height,
        weight,
        quantity: quantity || 1,
        jobId
      }
    });


    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

export const getItemsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Verify job exists and belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Fetch items for the job
    const items = await prisma.item.findMany({
      where: { jobId }
    });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Find the item and verify it belongs to a job owned by the user
    const item = await prisma.item.findFirst({
      where: { id: itemId },
      include: {
        job: true
      }
    });

    if (!item || item.job.userId !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete the item
    await prisma.item.delete({
      where: { id: itemId }
    });
    res.json({ message: 'Item deleted successfully' });
    } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const { name, length, width, height, weight, quantity } = req.body;

    // 1. Find item and verify ownership
    const item = await prisma.item.findFirst({
      where: { id: itemId },
      include: { job: true }
    });

    if (!item || item.job.userId !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // 2. Update the item
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        name,
        length,
        width,
        height,
        weight,
        quantity
      }
    });

    // 3. Return updated item
    res.json(updatedItem);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};


// Add this function after your existing functions
export const uploadItemsCsv = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // 1. Verify job exists and belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // 2. Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 3. Parse CSV file
    const items = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          // Validate each row
          const item = {
            name: row.name?.trim(),
            length: parseFloat(row.length),
            width: parseFloat(row.width),
            height: parseFloat(row.height),
            weight: parseFloat(row.weight),
            quantity: parseInt(row.quantity) || 1
          };

          // Check for valid data
          if (!item.name || isNaN(item.length) || isNaN(item.width) || 
              isNaN(item.height) || isNaN(item.weight)) {
            errors.push(`Invalid row: ${JSON.stringify(row)}`);
          } else {
            items.push(item);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // 4. Delete temp file
    fs.unlinkSync(req.file.path);

    // 5. If no valid items, return error
    if (items.length === 0) {
      return res.status(400).json({ 
        error: 'No valid items found in CSV',
        details: errors 
      });
    }

    // 6. Bulk create items
    const createdItems = await prisma.item.createMany({
      data: items.map(item => ({
        ...item,
        jobId
      }))
    });

    // 7. Fetch and return created items
    const allItems = await prisma.item.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(201).json({
      message: `${createdItems.count} items created`,
      errors: errors.length > 0 ? errors : undefined,
      items: allItems
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
};