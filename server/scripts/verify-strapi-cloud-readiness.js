/**
 * Verification script to ensure Strapi is ready for Cloud deployment
 * This script checks all critical components and data integrity
 */

module.exports = {
  async verifyReadiness() {
    console.log('🔍 Verifying Strapi Cloud readiness...');
    
    try {
      await strapi.db.transaction(async ({ onCommit, onRollback }) => {
        const results = {
          database: false,
          content: false,
          system: false,
          migrations: false,
          permissions: false
        };
        
        // 1. Database Connection Test
        console.log('📊 Testing database connection...');
        const dbTest = await strapi.db.query('strapi::core-store').count();
        results.database = true;
        console.log('✅ Database connection: OK');
        
        // 2. Content Data Verification
        console.log('📝 Verifying content data...');
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
        
        const totalContent = Object.values(contentCounts).reduce((sum, count) => sum + count, 0);
        console.log(`📊 Total content records: ${totalContent}`);
        
        // Verify minimum expected content
        const hasMinimumContent = contentCounts.blogs >= 6 && contentCounts.videos >= 166 && contentCounts.categories >= 26;
        results.content = hasMinimumContent;
        console.log(hasMinimumContent ? '✅ Content data: OK' : '❌ Content data: INSUFFICIENT');
        
        // 3. System Data Verification
        console.log('⚙️ Verifying system data...');
        const systemCounts = {
          adminUsers: await strapi.db.query('admin::user').count(),
          adminRoles: await strapi.db.query('admin::role').count(),
          coreStore: await strapi.db.query('strapi::core-store').count(),
        };
        
        const hasSystemData = systemCounts.adminUsers > 0 && systemCounts.adminRoles > 0;
        results.system = hasSystemData;
        console.log(hasSystemData ? '✅ System data: OK' : '❌ System data: MISSING');
        
        // 4. Migration State Verification
        console.log('🔄 Verifying migration state...');
        const migrationCount = await strapi.db.query('strapi::migration').count();
        const hasMigrations = migrationCount >= 6; // Expected minimum migrations
        results.migrations = hasMigrations;
        console.log(hasMigrations ? '✅ Migration state: OK' : '❌ Migration state: INCOMPLETE');
        
        // 5. Database Permissions Test
        console.log('🔐 Testing database permissions...');
        try {
          // Test CREATE permission
          await strapi.db.connection.raw('SELECT has_schema_privilege(?, ?, ?)', ['strapi', 'public', 'CREATE']);
          // Test USAGE permission  
          await strapi.db.connection.raw('SELECT has_schema_privilege(?, ?, ?)', ['strapi', 'public', 'USAGE']);
          results.permissions = true;
          console.log('✅ Database permissions: OK');
        } catch (error) {
          results.permissions = false;
          console.log('❌ Database permissions: FAILED');
        }
        
        // 6. API Endpoints Test
        console.log('🌐 Testing API endpoints...');
        const apiTest = await strapi.db.query('api::blog.blog').findMany({ limit: 1 });
        const apiWorking = Array.isArray(apiTest);
        console.log(apiWorking ? '✅ API endpoints: OK' : '❌ API endpoints: FAILED');
        
        // Final Assessment
        const allChecksPassed = Object.values(results).every(check => check === true);
        
        onCommit(() => {
          console.log('\n🎯 STRAPI CLOUD READINESS ASSESSMENT');
          console.log('=====================================');
          console.log(`Database Connection: ${results.database ? '✅' : '❌'}`);
          console.log(`Content Data: ${results.content ? '✅' : '❌'}`);
          console.log(`System Data: ${results.system ? '✅' : '❌'}`);
          console.log(`Migration State: ${results.migrations ? '✅' : '❌'}`);
          console.log(`Database Permissions: ${results.permissions ? '✅' : '❌'}`);
          console.log(`API Endpoints: ${apiWorking ? '✅' : '❌'}`);
          console.log('=====================================');
          
          if (allChecksPassed && apiWorking) {
            console.log('🚀 READY FOR STRAPI CLOUD DEPLOYMENT!');
            console.log('📋 Next steps:');
            console.log('   1. Create Strapi Cloud project');
            console.log('   2. Configure environment variables');
            console.log('   3. Deploy your codebase');
            console.log('   4. Import database data');
          } else {
            console.log('⚠️  NOT READY - Please fix the issues above');
          }
        });
        
        onRollback(() => {
          console.log('❌ Verification failed - transaction rolled back');
        });
      });
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    }
  }
};
