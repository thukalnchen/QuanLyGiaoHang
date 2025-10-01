const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const debugUsers = async () => {
    try {
        console.log('🔍 Debugging user accounts...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Get all users
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'isActive', 'password']
        });
        
        console.log(`📊 Found ${users.length} users in database:`);
        
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Active: ${user.isActive}`);
            console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
        });
        
        // Test admin login specifically
        const adminUser = await User.findOne({ where: { username: 'admin' } });
        
        if (!adminUser) {
            console.log('❌ Admin user not found!');
            console.log('🔧 Creating admin user manually...');
            
            const hashedPassword = await bcrypt.hash('admin123', 12);
            const newAdmin = await User.create({
                username: 'admin',
                email: 'admin@company.com',
                password: hashedPassword,
                fullName: 'Administrator',
                phone: '0123456789',
                role: 'admin',
                isActive: true
            });
            
            console.log('✅ Admin user created successfully!');
            console.log(`- Username: ${newAdmin.username}`);
            console.log(`- Password: admin123`);
            console.log(`- Role: ${newAdmin.role}`);
            
        } else {
            console.log('✅ Admin user found!');
            console.log(`- Username: ${adminUser.username}`);
            console.log(`- Role: ${adminUser.role}`);
            console.log(`- Active: ${adminUser.isActive}`);
            
            // Test password
            const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
            console.log(`- Password 'admin123' valid: ${isPasswordValid}`);
            
            if (!isPasswordValid) {
                console.log('🔧 Updating admin password...');
                const hashedPassword = await bcrypt.hash('admin123', 12);
                await adminUser.update({ password: hashedPassword });
                console.log('✅ Admin password updated!');
            }
        }
        
        console.log('\n🎯 Test login credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        throw error;
    }
};

// Run debug if this file is executed directly
if (require.main === module) {
    debugUsers()
        .then(() => {
            console.log('✅ Debug completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Debug failed:', error);
            process.exit(1);
        });
}

module.exports = debugUsers;
