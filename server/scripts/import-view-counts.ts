/**
 * Script to import view counts from CSV file to Strapi content types
 * 
 * Usage: pnpm tsx scripts/import-view-counts.ts <path-to-csv-file>
 * 
 * CSV format expected:
 * - Column 1: page (slug)
 * - Column 2: visitors (number)
 * - Column 3: total (number - this will be used as the views count)
 * 
 * Note: Requires Strapi server to be running or STRAPI_BASE_URL env variable
 */

import * as fs from 'fs';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import qs from 'qs';

// Load environment variables
dotenv.config();

interface CsvRow {
  page: string;
  visitors: number;
  total: number;
}

interface ContentTypeInfo {
  apiName: string;
  displayName: string;
}

// Content types that have views field
const CONTENT_TYPES_WITH_VIEWS: ContentTypeInfo[] = [
  { apiName: 'blogs', displayName: 'blog' },
  { apiName: 'videos', displayName: 'video' },
  { apiName: 'responsas', displayName: 'responsa' },
  { apiName: 'writings', displayName: 'writing' },
  { apiName: 'terms', displayName: 'term' }
];

const STRAPI_BASE_URL = 'http://localhost:1337';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;
const STRAPI_API_TOKEN = 'fc7ad542a52bfc1cc2361b772f3486a389f8212bd2a774059c5f3d2e4e69c63b1ca97443b398b62ebcdfca9e80997656c904d095de3b2ffda6f0ef8e801de58dd8c8527318f1aaa8247cb7088aec312c028541f3862051eb1922e0f76a102fa758cfa2e5a712c2f4f77de03946be9181308833f727ff8de7b0109461026f2488';

// Helper function to get headers for Strapi API requests
const getStrapiHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  };
};

async function findContentBySlug(slug: string): Promise<{ id: number; documentId: string; contentType: string; currentViews: number } | null> {
  for (const { apiName, displayName } of CONTENT_TYPES_WITH_VIEWS) {
    try {
      // Use the same query format as loaders.ts
      const query = qs.stringify({
        filters: {
          slug: { $eq: slug }
        }
      });
      
      const url = `${STRAPI_URL}/${apiName}?${query}`;
      const response = await fetch(url, {
        headers: getStrapiHeaders()
      });
      
      if (!response.ok) {
        continue;
      }
      
      const data = await response.json() as { data: Array<{ id: number; documentId?: string; views?: number; slug?: string }> };
      
      if (data.data && data.data.length > 0) {
        const content = data.data[0];
        return {
          id: content.id,
          documentId: content.documentId || '',
          contentType: displayName,
          currentViews: content.views || 0
        };
      }
    } catch (error) {
      // Suppress connection errors (server not running) - they're expected
      const errorCode = (error as any)?.code;
      if (errorCode !== 'ECONNREFUSED') {
        // Log error for debugging if it's not a connection error
        if (slug === 'loss-of-faith' || slug === 'Loss-Of-Faith' || slug.includes('question-')) {
          console.log(`💥 Error querying ${apiName} for "${slug}":`, error);
        }
      }
      continue;
    }
  }
  
  return null;
}

async function updateViewCount(contentType: string, documentId: string, id: number, newViews: number): Promise<boolean> {
  try {
    // Try with documentId first (Strapi v5), then fallback to id
    // Only use documentId if it's not empty
    let url = documentId ? `${STRAPI_URL}/${contentType}s/${documentId}` : `${STRAPI_URL}/${contentType}s/${id}`;
    
    const payload = {
      data: {
        views: newViews
      }
    };
    
    let response = await fetch(url, {
      method: 'PUT',
      headers: getStrapiHeaders(),
      body: JSON.stringify(payload)
    });
    
    // If documentId fails, try with regular id
    if (!response.ok && documentId) {
      url = `${STRAPI_URL}/${contentType}s/${id}`;
      response = await fetch(url, {
        method: 'PUT',
        headers: getStrapiHeaders(),
        body: JSON.stringify(payload)
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText.substring(0, 200)}`);
      return false;
    }
    
    return true;
  } catch (error) {
    const errorCode = (error as any)?.code;
    // Suppress connection errors
    if (errorCode !== 'ECONNREFUSED') {
      console.error(`Error updating ${contentType} ${id}:`, error);
    }
    return false;
  }
}

function parseCsvFile(filePath: string): CsvRow[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
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
        }
      }
    }
    
    return rows;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw error;
  }
}

async function importViewCounts(filePath: string) {
  console.log('🚀 Starting view counts import...');
  console.log(`📡 Strapi URL: ${STRAPI_BASE_URL}`);
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${STRAPI_BASE_URL}/api/blogs?pagination[limit]=1`, {
      headers: getStrapiHeaders()
    });
    if (!healthCheck.ok && healthCheck.status !== 401 && healthCheck.status !== 403) {
      throw new Error(`Server returned ${healthCheck.status}`);
    }
  } catch (error) {
    const errorCode = (error as any)?.code;
    if (errorCode === 'ECONNREFUSED') {
      console.error('\n❌ ERROR: Cannot connect to Strapi server!');
      console.error('   Please make sure Strapi is running on localhost:1337');
      console.error('   Start it with: cd server && pnpm develop\n');
      process.exit(1);
    }
    throw error;
  }
  
  // Parse CSV file
  console.log(`📊 Reading CSV file: ${filePath}`);
  const csvData = parseCsvFile(filePath);
  console.log(`📋 Found ${csvData.length} rows to process`);
  
  if (csvData.length === 0) {
    console.log('❌ No valid data found in CSV file');
    return;
  }
  
  let processed = 0;
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  
  console.log('🔄 Processing rows...\n');
  
  for (const row of csvData) {
    processed++;
    
    try {
      // Clean the slug - remove leading/trailing slashes and spaces
      let cleanSlug = row.page.replace(/^\/+|\/+$/g, '').trim();
      
      // Only process rows that start with one of the content type prefixes
      const prefixes = ['blog/', 'video/', 'responsa/', 'writings/', 'terms/'];
      const hasPrefix = prefixes.some(prefix => cleanSlug.toLowerCase().startsWith(prefix));
      
      if (!hasPrefix) {
        // Skip rows that don't start with any content type prefix
        continue;
      }
      
      // Remove content type prefixes (blog/, video/, responsa/, writings/, terms/)
      for (const prefix of prefixes) {
        if (cleanSlug.toLowerCase().startsWith(prefix)) {
          cleanSlug = cleanSlug.substring(prefix.length);
          break;
        }
      }
      
      if (!cleanSlug) {
        console.log(`⚠️  Row ${processed}: Empty slug after prefix removal, skipping`);
        continue;
      }
      
      // Find content by slug - try exact match first, then lowercase
      let content = await findContentBySlug(cleanSlug);
      
      // If not found, try lowercase version
      if (!content && cleanSlug !== cleanSlug.toLowerCase()) {
        content = await findContentBySlug(cleanSlug.toLowerCase());
        if (content) {
          // Use the lowercase slug for logging
          cleanSlug = cleanSlug.toLowerCase();
        }
      }
      
      if (!content) {
        notFound++;
        if (processed % 10 === 0 || processed <= 5) {
          console.log(`❓ Row ${processed}: No content found for slug "${cleanSlug}"`);
        }
        continue;
      }
      
      // Update view count
      const success = await updateViewCount(content.contentType, content.documentId, content.id, row.total);
      
      if (success) {
        updated++;
        console.log(`✅ Row ${processed}: Updated ${content.contentType} "${cleanSlug}" views: ${content.currentViews} → ${row.total}`);
      } else {
        errors++;
        console.log(`❌ Row ${processed}: Failed to update ${content.contentType} "${cleanSlug}"`);
      }
      
    } catch (error) {
      errors++;
      console.error(`💥 Row ${processed}: Error processing "${row.page}":`, error);
    }
  }
  
  console.log('\n📈 Import Summary:');
  console.log(`   Total rows processed: ${processed}`);
  console.log(`   Successfully updated: ${updated}`);
  console.log(`   Content not found: ${notFound}`);
  console.log(`   Errors: ${errors}`);
  
  console.log('\n✨ Import completed!');
}

// Main execution
async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ Please provide the path to the CSV file');
    console.log('Usage: pnpm tsx scripts/import-view-counts.ts <path-to-csv-file>');
    process.exit(1);
  }
  
  try {
    await importViewCounts(filePath);
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { importViewCounts };