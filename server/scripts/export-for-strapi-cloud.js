/**
 * Export script for Strapi Cloud deployment
 * This script exports all data in a format suitable for Strapi Cloud
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  async exportData() {
    console.log('🚀 Starting data export for Strapi Cloud...');
    
    try {
      // Use Strapi's transaction API to ensure data consistency
      await strapi.db.transaction(async ({ trx, onCommit, onRollback }) => {
        console.log('📊 Collecting data from database...');
        
        // Export content data
        const contentData = {
          authors: await strapi.db.query('api::author.author').findMany({ populate: '*' }),
          blogs: await strapi.db.query('api::blog.blog').findMany({ populate: '*' }),
          videos: await strapi.db.query('api::video.video').findMany({ populate: '*' }),
          categories: await strapi.db.query('api::category.category').findMany({ populate: '*' }),
          playlists: await strapi.db.query('api::playlist.playlist').findMany({ populate: '*' }),
          writings: await strapi.db.query('api::writing.writing').findMany({ populate: '*' }),
          responsas: await strapi.db.query('api::responsa.responsa').findMany({ populate: '*' }),
          terms: await strapi.db.query('api::term.term').findMany({ populate: '*' }),
          comments: await strapi.db.query('api::comment.comment').findMany({ populate: '*' }),
        };
        
        // Export system data
        const systemData = {
          adminUsers: await strapi.db.query('admin::user').findMany(),
          adminRoles: await strapi.db.query('admin::role').findMany(),
          coreStoreSettings: await strapi.db.query('strapi::core-store').findMany(),
        };
        
        // Create export object
        const exportData = {
          metadata: {
            exportDate: new Date().toISOString(),
            strapiVersion: strapi.config.info.version,
            databaseType: 'postgresql',
            totalRecords: Object.values(contentData).reduce((sum, arr) => sum + arr.length, 0)
          },
          content: contentData,
          system: systemData
        };
        
        // Write export file
        const exportPath = path.join(__dirname, '..', 'exports', 'strapi-cloud-export.json');
        const exportDir = path.dirname(exportPath);
        
        if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir, { recursive: true });
        }
        
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        
        onCommit(() => {
          console.log(`✅ Data exported successfully to: ${exportPath}`);
          console.log(`📊 Total records exported: ${exportData.metadata.totalRecords}`);
          console.log('🌐 Ready for Strapi Cloud deployment!');
        });
        
        onRollback(() => {
          console.error('❌ Export failed - transaction rolled back');
        });
      });
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  },
  
  async verifyDataIntegrity() {
    console.log('🔍 Verifying data integrity...');
    
    try {
      await strapi.db.transaction(async () => {
        // Check content tables
        const contentCounts = {
          authors: await strapi.db.query('api::author.author').count(),
          blogs: await strapi.db.query('api::blog.blog').count(),
          videos: await strapi.db.query('api::video.video').count(),
          categories: await strapi.db.query('api::category.category').count(),
          playlists: await strapi.db.query('api::playlist.playlist').count(),
          writings: await strapi.db.query('api::writing.writing').count(),
          responsas: await strapi.db.query('api::responsa.responsa').count(),
          terms: await strapi.db.query('api::term.term').count(),
          comments: await strapi.db.query('api::comment.comment').count(),
        };
        
        console.log('📊 Content data counts:');
        Object.entries(contentCounts).forEach(([table, count]) => {
          console.log(`  - ${table}: ${count} records`);
        });
        
        // Verify relationships
        const blogsWithAuthors = await strapi.db.query('api::blog.blog').count({
          where: {
            authors: {
              $notNull: true
            }
          }
        });
        
        const videosWithPlaylists = await strapi.db.query('api::video.video').count({
          where: {
            playlists: {
              $notNull: true
            }
          }
        });
        
        console.log(`🔗 Relationships: ${blogsWithAuthors} blogs with authors, ${videosWithPlaylists} videos with playlists`);
        
        console.log('✅ Data integrity verification completed');
      });
      
    } catch (error) {
      console.error('❌ Data integrity check failed:', error);
      throw error;
    }
  }
};
