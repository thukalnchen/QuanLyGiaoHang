const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const fixAdminAccount = async () => {
    try {
        console.log('🔧 Fixing admin account...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Find admin user
        let adminUser = await User.findOne({ where: { username: 'admin' } });
        
        if (!adminUser) {
            console.log('❌ Admin user not found! Creating new admin user...');
            
            const hashedPassword = await bcrypt.hash('admin123', 12);
            adminUser = await User.create({
                username: 'admin',
                email: 'admin@company.com',
                password: hashedPassword,
                fullName: 'Administrator',
                phone: '0123456789',
                role: 'admin',
                isActive: true
            });
            
            console.log('✅ Admin user created successfully!');
        } else {
            console.log('✅ Admin user found!');
            console.log(`- Username: ${adminUser.username}`);
            console.log(`- Role: ${adminUser.role}`);
            console.log(`- Active: ${adminUser.isActive}`);
            
            // Test current password
            const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
            console.log(`- Current password 'admin123' valid: ${isPasswordValid}`);
            
            if (!isPasswordValid) {
                console.log('🔧 Password is invalid. Updating password...');
                const hashedPassword = await bcrypt.hash('admin123', 12);
                await adminUser.update({ password: hashedPassword });
                console.log('✅ Password updated successfully!');
            }
            
            // Ensure user is active
            if (!adminUser.isActive) {
                console.log('🔧 User is inactive. Activating...');
                await adminUser.update({ isActive: true });
                console.log('✅ User activated successfully!');
            }
        }
        
        // Final test
        console.log('\n🧪 Testing login with fixed account...');
        const finalTest = await bcrypt.compare('admin123', adminUser.password);
        console.log(`✅ Password test result: ${finalTest}`);
        
        console.log('\n🎯 Login credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\n🚀 Try logging in now!');
        
    } catch (error) {
        console.error('❌ Fix admin account failed:', error);
        throw error;
    }
};

// Run fix if this file is executed directly
if (require.main === module) {
    fixAdminAccount()
        .then(() => {
            console.log('✅ Fix completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Fix failed:', error);
            process.exit(1);
        });
}

module.exports = fixAdminAccount;
