/**
 * Script to view all view counts from Strapi content types
 * 
 * Usage: pnpm tsx scripts/view-view-counts.ts [--export-csv]
 * 
 * Options:
 *   --export-csv    Export results to CSV file
 * 
 * Note: Requires Strapi server to be running or STRAPI_BASE_URL env variable
 */

import * as fs from 'fs';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import qs from 'qs';

// Load environment variables
dotenv.config();

interface ContentTypeInfo {
  apiName: string;
  displayName: string;
}

interface ContentItem {
  id: number;
  documentId?: string;
  slug?: string;
  title?: string;
  views: number;
  contentType: string;
}

// Content types that have views field
const CONTENT_TYPES_WITH_VIEWS: ContentTypeInfo[] = [
  { apiName: 'blogs', displayName: 'blog' },
  { apiName: 'videos', displayName: 'video' },
  { apiName: 'responsas', displayName: 'responsa' },
  { apiName: 'writings', displayName: 'writing' },
  { apiName: 'terms', displayName: 'term' }
];

const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Helper function to get headers for Strapi API requests
const getStrapiHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  };
};

async function fetchAllContent(contentType: ContentTypeInfo): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const query = qs.stringify({
        pagination: {
          page,
          pageSize
        },
        fields: ['id', 'documentId', 'slug', 'title', 'views'],
        sort: ['views:desc']
      });

      const url = `${STRAPI_URL}/${contentType.apiName}?${query}`;
      const response = await fetch(url, {
        headers: getStrapiHeaders()
      });

      if (!response.ok) {
        console.error(`Error fetching ${contentType.apiName}: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json() as { 
        data: Array<{ 
          id: number; 
          documentId?: string; 
          slug?: string; 
          title?: string; 
          views?: number;
        }>; 
        meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
      };

      if (data.data && data.data.length > 0) {
        for (const item of data.data) {
          items.push({
            id: item.id,
            documentId: item.documentId,
            slug: item.slug,
            title: item.title,
            views: item.views || 0,
            contentType: contentType.displayName
          });
        }

        // Check if there are more pages
        const pagination = data.meta?.pagination;
        if (pagination) {
          hasMore = page < pagination.pageCount;
          page++;
        } else {
          hasMore = data.data.length === pageSize;
          page++;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      const errorCode = (error as { code?: string })?.code;
      if (errorCode === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Strapi server at ${STRAPI_BASE_URL}`);
      }
      console.error(`Error fetching ${contentType.apiName}:`, error);
      hasMore = false;
    }
  }

  return items;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function displayResults(allItems: ContentItem[], exportCsv: boolean = false) {
  // Sort all items by view count (descending)
  const sortedItems = [...allItems].sort((a, b) => b.views - a.views);

  // Calculate statistics
  const totalViews = sortedItems.reduce((sum, item) => sum + item.views, 0);
  const totalItems = sortedItems.length;
  const itemsWithViews = sortedItems.filter(item => item.views > 0).length;
  const averageViews = totalItems > 0 ? Math.round(totalViews / totalItems) : 0;

  // Group by content type
  const byType: Record<string, ContentItem[]> = {};
  for (const item of sortedItems) {
    if (!byType[item.contentType]) {
      byType[item.contentType] = [];
    }
    byType[item.contentType].push(item);
  }

  console.log('\n📊 View Counts Summary\n');
  console.log('═'.repeat(80));
  console.log(`Total Items: ${formatNumber(totalItems)}`);
  console.log(`Items with Views: ${formatNumber(itemsWithViews)}`);
  console.log(`Total Views: ${formatNumber(totalViews)}`);
  console.log(`Average Views: ${formatNumber(averageViews)}`);
  console.log('═'.repeat(80));

  // Statistics by content type
  console.log('\n📈 Statistics by Content Type:\n');
  for (const [type, items] of Object.entries(byType)) {
    const typeTotal = items.reduce((sum, item) => sum + item.views, 0);
    const typeAvg = items.length > 0 ? Math.round(typeTotal / items.length) : 0;
    const typeWithViews = items.filter(item => item.views > 0).length;
    const topItem = items[0];
    
    console.log(`  ${type.toUpperCase()}:`);
    console.log(`    Total Items: ${formatNumber(items.length)}`);
    console.log(`    Items with Views: ${formatNumber(typeWithViews)}`);
    console.log(`    Total Views: ${formatNumber(typeTotal)}`);
    console.log(`    Average Views: ${formatNumber(typeAvg)}`);
    if (topItem) {
      console.log(`    Top Item: "${topItem.title || topItem.slug || `ID ${topItem.id}`}" (${formatNumber(topItem.views)} views)`);
    }
    console.log('');
  }

  // Top 20 items
  console.log('🏆 Top 20 Items by View Count:\n');
  console.log('─'.repeat(80));
  console.log(`${'Rank'.padEnd(6)}${'Type'.padEnd(12)}${'Views'.padEnd(12)}${'Title/Slug'}`);
  console.log('─'.repeat(80));
  
  const top20 = sortedItems.slice(0, 20);
  for (let i = 0; i < top20.length; i++) {
    const item = top20[i];
    const rank = (i + 1).toString().padEnd(6);
    const type = item.contentType.padEnd(12);
    const views = formatNumber(item.views).padEnd(12);
    const title = (item.title || item.slug || `ID ${item.id}`).substring(0, 50);
    console.log(`${rank}${type}${views}${title}`);
  }
  console.log('─'.repeat(80));

  // Items with zero views
  const zeroViews = sortedItems.filter(item => item.views === 0);
  if (zeroViews.length > 0) {
    console.log(`\n⚠️  Items with Zero Views: ${formatNumber(zeroViews.length)}\n`);
    if (zeroViews.length <= 20) {
      for (const item of zeroViews) {
        console.log(`  - ${item.contentType}: "${item.title || item.slug || `ID ${item.id}`}"`);
      }
    } else {
      console.log(`  (Showing first 20 of ${formatNumber(zeroViews.length)} items)\n`);
      for (const item of zeroViews.slice(0, 20)) {
        console.log(`  - ${item.contentType}: "${item.title || item.slug || `ID ${item.id}`}"`);
      }
    }
  }

  // Export to CSV if requested
  if (exportCsv) {
    const csvPath = `view-counts-export-${Date.now()}.csv`;
    const csvLines = [
      'Content Type,ID,Document ID,Slug,Title,Views'
    ];

    for (const item of sortedItems) {
      const line = [
        item.contentType,
        item.id.toString(),
        item.documentId || '',
        item.slug || '',
        (item.title || '').replace(/"/g, '""'), // Escape quotes in CSV
        item.views.toString()
      ].map(field => `"${field}"`).join(',');
      csvLines.push(line);
    }

    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');
    console.log(`\n💾 Exported to: ${csvPath}`);
  }
}

async function viewViewCounts(exportCsv: boolean = false) {
  console.log('🚀 Fetching view counts from Strapi...');
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
    const errorCode = (error as { code?: string })?.code;
    if (errorCode === 'ECONNREFUSED') {
      console.error('\n❌ ERROR: Cannot connect to Strapi server!');
      console.error(`   Please make sure Strapi is running at ${STRAPI_BASE_URL}`);
      console.error('   Start it with: cd server && pnpm develop\n');
      process.exit(1);
    }
    throw error;
  }

  const allItems: ContentItem[] = [];

  // Fetch all content types
  for (const contentType of CONTENT_TYPES_WITH_VIEWS) {
    console.log(`📥 Fetching ${contentType.displayName}...`);
    try {
      const items = await fetchAllContent(contentType);
      allItems.push(...items);
      console.log(`   ✓ Found ${items.length} items`);
    } catch (error) {
      console.error(`   ✗ Error fetching ${contentType.displayName}:`, error);
    }
  }

  if (allItems.length === 0) {
    console.log('❌ No content found');
    return;
  }

  // Display results
  displayResults(allItems, exportCsv);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const exportCsv = args.includes('--export-csv');

  try {
    await viewViewCounts(exportCsv);
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

export { viewViewCounts };










