const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const forceFixAdminPassword = async () => {
    try {
        console.log('🔧 Force fixing admin password (bypassing hooks)...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Hash password manually
        const hashedPassword = await bcrypt.hash('admin123', 12);
        console.log('✅ Password hashed manually');
        
        // Update password directly in database (bypassing Sequelize hooks)
        const [updatedRows] = await sequelize.query(
            'UPDATE users SET password = $1, "updatedAt" = NOW() WHERE username = $2',
            {
                bind: [hashedPassword, 'admin'],
                type: sequelize.QueryTypes.UPDATE
            }
        );
        
        console.log(`✅ Updated ${updatedRows} row(s)`);
        
        // Verify the update
        const adminUser = await User.findOne({ where: { username: 'admin' } });
        if (adminUser) {
            const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
            console.log(`✅ Password verification: ${isPasswordValid}`);
            
            if (isPasswordValid) {
                console.log('\n🎉 Admin password fixed successfully!');
                console.log('🎯 Login credentials:');
                console.log('Username: admin');
                console.log('Password: admin123');
            } else {
                console.log('❌ Password verification failed');
            }
        }
        
    } catch (error) {
        console.error('❌ Force fix failed:', error);
        throw error;
    }
};

// Run fix if this file is executed directly
if (require.main === module) {
    forceFixAdminPassword()
        .then(() => {
            console.log('✅ Force fix completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Force fix failed:', error);
            process.exit(1);
        });
}

module.exports = forceFixAdminPassword;
