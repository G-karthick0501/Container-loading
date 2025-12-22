/**
 * Formats optimization result for export
 * Removes internal IDs, adds human-readable names
 */

import jsPDF from 'jspdf';

export function formatExportData(job, items, optimizationResult) {
  // Create lookup: itemId → itemName
  const itemNames = {};
  items.forEach(item => {
    itemNames[item.id] = item.name;
  });

  return {
    jobName: job.name,
    container: job.container?.name || 'Custom',
    containerDimensions: {
      length: job.container?.length || job.customLength,
      width: job.container?.width || job.customWidth,
      height: job.container?.height || job.customHeight
    },
    stats: {
      totalItems: optimizationResult.stats.totalItems,
      placedCount: optimizationResult.stats.placedCount,
      unplacedCount: optimizationResult.stats.unplacedCount,
      utilization: optimizationResult.stats.utilization
    },
    placements: optimizationResult.placements.map(p => ({
      itemName: itemNames[p.itemId] || 'Unknown',
      position: { x: p.x, y: p.y, z: p.z },
      dimensions: {
        length: p.placedLength,
        width: p.placedWidth,
        height: p.placedHeight
      },
      rotated: p.rotated,
      placed: p.placed
    }))
  };
}

/**
 * Triggers browser download of JSON data
 */
export function downloadJSON(data, filename) {
  // 1. Convert to JSON string (pretty printed)
  const jsonString = JSON.stringify(data, null, 2);
  
  // 2. Create Blob
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // 3. Create temporary URL
  const url = URL.createObjectURL(blob);
  
  // 4. Create invisible link and click it
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // 5. Cleanup
  URL.revokeObjectURL(url);
}


/**
 * Generates and downloads a PDF load plan
 */
export function downloadPDF(job, items, optimizationResult) {
  const doc = new jsPDF();
  let y = 20; // Current y position
  
  // Helper to add text and move down
  const addLine = (text, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, 20, y);
    y += fontSize * 0.5 + 2;
  };
  
  // Helper to add a horizontal line
  const addDivider = () => {
    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    y += 5;
  };

  // ========== HEADER ==========
  addLine('CONTAINER LOAD PLAN', 18, true);
  addLine(`Job: ${job.name}`, 12);
  addLine(`Generated: ${new Date().toLocaleDateString()}`, 10);
  y += 5;
  addDivider();

  // ========== CONTAINER INFO ==========
  addLine('CONTAINER', 14, true);
  const containerName = job.container?.name || 'Custom';
  const dims = job.container || { length: job.customLength, width: job.customWidth, height: job.customHeight };
  addLine(`Name: ${containerName}`);
  addLine(`Dimensions: ${dims.length} × ${dims.width} × ${dims.height} mm`);
  y += 3;
  addDivider();

  // ========== SUMMARY ==========
  addLine('SUMMARY', 14, true);
  const stats = optimizationResult.stats;
  addLine(`Total Items: ${stats.totalItems}`);
  addLine(`Placed: ${stats.placedCount} | Unplaced: ${stats.unplacedCount}`);
  addLine(`Utilization: ${stats.utilization}%`);
  y += 3;
  addDivider();

  // ========== LOADING ORDER ==========
  addLine('LOADING ORDER', 14, true);
  y += 2;
  
  // Table header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 20, y);
  doc.text('Item Name', 30, y);
  doc.text('Position (x, y, z)', 100, y);
  doc.text('Dimensions', 150, y);
  y += 6;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  
  // Create item name lookup
  const itemNames = {};
  items.forEach(item => {
    itemNames[item.id] = item.name;
  });
  
  // Only show placed items, in order
  const placedItems = optimizationResult.placements.filter(p => p.placed);
  
  placedItems.forEach((p, index) => {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    const num = String(index + 1);
    const name = itemNames[p.itemId] || 'Unknown';
    const pos = `${p.x}, ${p.y}, ${p.z}`;
    const dims = `${p.placedLength}×${p.placedWidth}×${p.placedHeight}`;
    
    doc.text(num, 20, y);
    doc.text(name.substring(0, 25), 30, y); // Truncate long names
    doc.text(pos, 100, y);
    doc.text(dims, 150, y);
    y += 5;
  });

  // ========== SAVE ==========
  const filename = `${job.name.replace(/\s+/g, '_')}_load_plan.pdf`;
  doc.save(filename);
}