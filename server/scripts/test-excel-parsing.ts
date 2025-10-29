/**
 * Test script to validate CSV parsing without connecting to Strapi
 * 
 * Usage: pnpm tsx scripts/test-csv-parsing.ts <path-to-csv-file>
 */

import * as fs from 'fs';

interface CsvRow {
  page: string;
  visitors: number;
  total: number;
}

function parseCsvFile(filePath: string): CsvRow[] {
  try {
    console.log(`📊 Reading CSV file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    console.log(`📄 Total rows in file: ${lines.length}`);
    
    const rows: CsvRow[] = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma, handling quoted values
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length >= 3 && columns[0] && columns[2]) {
        const page = String(columns[0]).trim();
        const visitors = Number(columns[1]) || 0;
        const total = Number(columns[2]) || 0;
        
        // Skip rows with invalid data
        if (page && total > 0) {
          rows.push({ page, visitors, total });
        } else {
          console.log(`⚠️  Row ${i + 1}: Skipping invalid data - page: "${page}", total: ${total}`);
        }
      } else {
        console.log(`⚠️  Row ${i + 1}: Insufficient columns or empty data - columns: ${columns.length}`);
      }
    }
    
    return rows;
  } catch (error) {
    console.error('❌ Error parsing CSV file:', error);
    throw error;
  }
}

function analyzeData(data: CsvRow[]) {
  console.log('\n📊 Data Analysis:');
  console.log(`   Valid rows: ${data.length}`);
  
  if (data.length === 0) {
    console.log('❌ No valid data found');
    return;
  }
  
  // Analyze slug patterns
  const slugPatterns = {
    blog: 0,
    video: 0,
    responsa: 0,
    writings: 0,
    terms: 0,
    playlists: 0,
    other: 0
  };
  
  const totalViews = data.reduce((sum, row) => sum + row.total, 0);
  const maxViews = Math.max(...data.map(row => row.total));
  const minViews = Math.min(...data.map(row => row.total));
  
  console.log(`   Total views across all content: ${totalViews.toLocaleString()}`);
  console.log(`   Highest view count: ${maxViews.toLocaleString()}`);
  console.log(`   Lowest view count: ${minViews.toLocaleString()}`);
  console.log(`   Average views per item: ${Math.round(totalViews / data.length).toLocaleString()}`);
  
  // Categorize by URL patterns
  data.forEach(row => {
    const cleanSlug = row.page.replace(/^\/+|\/+$/g, '').toLowerCase();
    
    if (cleanSlug.startsWith('blog/')) slugPatterns.blog++;
    else if (cleanSlug.startsWith('video/')) slugPatterns.video++;
    else if (cleanSlug.startsWith('responsa/')) slugPatterns.responsa++;
    else if (cleanSlug.startsWith('writings/')) slugPatterns.writings++;
    else if (cleanSlug.startsWith('terms/')) slugPatterns.terms++;
    else if (cleanSlug.startsWith('playlists/')) slugPatterns.playlists++;
    else slugPatterns.other++;
  });
  
  console.log('\n📂 Content Type Distribution:');
  Object.entries(slugPatterns).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`   ${type}: ${count} items`);
    }
  });
  
  // Show sample data
  console.log('\n📋 Sample Data (first 10 rows):');
  data.slice(0, 10).forEach((row, index) => {
    const cleanSlug = row.page.replace(/^\/+|\/+$/g, '');
    console.log(`   ${index + 1}. "${cleanSlug}" → ${row.total} views`);
  });
  
  if (data.length > 10) {
    console.log(`   ... and ${data.length - 10} more rows`);
  }
}

async function testCsvParsing(filePath: string) {
  try {
    const data = parseCsvFile(filePath);
    analyzeData(data);
    
    console.log('\n✅ CSV parsing test completed successfully!');
    console.log('💡 You can now run the full import with:');
    console.log(`   pnpm tsx scripts/import-view-counts.ts "${filePath}"`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ Please provide the path to the CSV file');
    console.log('Usage: pnpm tsx scripts/test-csv-parsing.ts <path-to-csv-file>');
    process.exit(1);
  }
  
  console.log('🧪 Testing CSV file parsing...\n');
  await testCsvParsing(filePath);
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}
