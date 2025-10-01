const { sequelize } = require('../models');

const initDatabase = async () => {
    try {
        console.log('🔧 Starting database initialization...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Sync database models (create tables)
        await sequelize.sync({ force: false });
        console.log('✅ Database models synchronized.');
        
        console.log('🎉 Database initialization completed successfully!');
        console.log('📋 Tables created:');
        console.log('- users');
        console.log('- service_types');
        console.log('- pricing');
        console.log('- orders');
        console.log('\n🚀 You can now run: node scripts/seed.js');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('✅ Initialization completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Initialization failed:', error);
            process.exit(1);
        });
}

module.exports = initDatabase;
