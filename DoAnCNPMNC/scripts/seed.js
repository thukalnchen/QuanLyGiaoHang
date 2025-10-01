const { User, ServiceType, Pricing, Order, sequelize } = require('../models');

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Create users
        const users = await User.bulkCreate([
            {
                username: 'admin',
                email: 'admin@company.com',
                password: 'admin123',
                fullName: 'Administrator',
                phone: '0123456789',
                role: 'admin',
                isActive: true
            },
            {
                username: 'staff1',
                email: 'staff1@company.com',
                password: 'staff123',
                fullName: 'Nguyễn Văn Staff',
                phone: '0123456790',
                role: 'staff',
                isActive: true
            },
            {
                username: 'staff2',
                email: 'staff2@company.com',
                password: 'staff123',
                fullName: 'Trần Thị Staff',
                phone: '0123456791',
                role: 'staff',
                isActive: true
            },
            {
                username: 'shipper1',
                email: 'shipper1@company.com',
                password: 'shipper123',
                fullName: 'Lê Văn Shipper',
                phone: '0123456792',
                role: 'shipper',
                isActive: true
            },
            {
                username: 'shipper2',
                email: 'shipper2@company.com',
                password: 'shipper123',
                fullName: 'Phạm Thị Shipper',
                phone: '0123456793',
                role: 'shipper',
                isActive: true
            }
        ]);

        console.log('✅ Users created:', users.length);

        // Create service types
        const serviceTypes = await ServiceType.bulkCreate([
            {
                name: 'Giao hàng tiêu chuẩn',
                description: 'Dịch vụ giao hàng tiêu chuẩn trong thành phố',
                isActive: true
            },
            {
                name: 'Giao hàng nhanh',
                description: 'Dịch vụ giao hàng nhanh trong ngày',
                isActive: true
            },
            {
                name: 'Giao hàng liên tỉnh',
                description: 'Dịch vụ giao hàng giữa các tỉnh thành',
                isActive: true
            },
            {
                name: 'Giao hàng quốc tế',
                description: 'Dịch vụ giao hàng quốc tế',
                isActive: true
            }
        ]);

        console.log('✅ Service types created:', serviceTypes.length);

        // Create pricing rules
        const pricingRules = await Pricing.bulkCreate([
            // Standard delivery pricing
            {
                serviceTypeId: serviceTypes[0].id,
                weightFrom: 0,
                weightTo: 1,
                price: 15000,
                fragilePrice: 5000,
                valuablePrice: 10000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[0].id,
                weightFrom: 1,
                weightTo: 5,
                price: 12000,
                fragilePrice: 5000,
                valuablePrice: 10000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[0].id,
                weightFrom: 5,
                weightTo: 10,
                price: 10000,
                fragilePrice: 5000,
                valuablePrice: 10000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[0].id,
                weightFrom: 10,
                weightTo: 50,
                price: 8000,
                fragilePrice: 5000,
                valuablePrice: 10000,
                isActive: true
            },

            // Fast delivery pricing
            {
                serviceTypeId: serviceTypes[1].id,
                weightFrom: 0,
                weightTo: 1,
                price: 25000,
                fragilePrice: 8000,
                valuablePrice: 15000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[1].id,
                weightFrom: 1,
                weightTo: 5,
                price: 20000,
                fragilePrice: 8000,
                valuablePrice: 15000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[1].id,
                weightFrom: 5,
                weightTo: 10,
                price: 18000,
                fragilePrice: 8000,
                valuablePrice: 15000,
                isActive: true
            },

            // Inter-province delivery pricing
            {
                serviceTypeId: serviceTypes[2].id,
                weightFrom: 0,
                weightTo: 1,
                price: 30000,
                fragilePrice: 10000,
                valuablePrice: 20000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[2].id,
                weightFrom: 1,
                weightTo: 5,
                price: 25000,
                fragilePrice: 10000,
                valuablePrice: 20000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[2].id,
                weightFrom: 5,
                weightTo: 10,
                price: 20000,
                fragilePrice: 10000,
                valuablePrice: 20000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[2].id,
                weightFrom: 10,
                weightTo: 50,
                price: 15000,
                fragilePrice: 10000,
                valuablePrice: 20000,
                isActive: true
            },

            // International delivery pricing
            {
                serviceTypeId: serviceTypes[3].id,
                weightFrom: 0,
                weightTo: 1,
                price: 500000,
                fragilePrice: 50000,
                valuablePrice: 100000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[3].id,
                weightFrom: 1,
                weightTo: 5,
                price: 400000,
                fragilePrice: 50000,
                valuablePrice: 100000,
                isActive: true
            },
            {
                serviceTypeId: serviceTypes[3].id,
                weightFrom: 5,
                weightTo: 10,
                price: 350000,
                fragilePrice: 50000,
                valuablePrice: 100000,
                isActive: true
            }
        ]);

        console.log('✅ Pricing rules created:', pricingRules.length);

        // Create sample orders
        const orders = await Order.bulkCreate([
            {
                orderCode: 'ORD001001',
                senderName: 'Nguyễn Văn A',
                senderPhone: '0123456789',
                senderAddress: '123 Đường ABC, Quận 1, TP.HCM',
                receiverName: 'Trần Thị B',
                receiverPhone: '0987654321',
                receiverAddress: '456 Đường XYZ, Quận 2, TP.HCM',
                serviceTypeId: serviceTypes[0].id,
                weight: 2.5,
                isFragile: false,
                isValuable: false,
                totalAmount: 30000,
                status: 'delivered',
                notes: 'Giao hàng thành công',
                createdBy: users[1].id
            },
            {
                orderCode: 'ORD001002',
                senderName: 'Lê Văn C',
                senderPhone: '0123456790',
                senderAddress: '789 Đường DEF, Quận 3, TP.HCM',
                receiverName: 'Phạm Thị D',
                receiverPhone: '0987654322',
                receiverAddress: '321 Đường GHI, Quận 4, TP.HCM',
                serviceTypeId: serviceTypes[1].id,
                weight: 1.2,
                isFragile: true,
                isValuable: false,
                totalAmount: 38000,
                status: 'shipping',
                notes: 'Hàng dễ vỡ, cần cẩn thận',
                createdBy: users[1].id
            },
            {
                orderCode: 'ORD001003',
                senderName: 'Hoàng Văn E',
                senderPhone: '0123456791',
                senderAddress: '654 Đường JKL, Quận 5, TP.HCM',
                receiverName: 'Vũ Thị F',
                receiverPhone: '0987654323',
                receiverAddress: '987 Đường MNO, Quận 6, TP.HCM',
                serviceTypeId: serviceTypes[0].id,
                weight: 8.5,
                isFragile: false,
                isValuable: true,
                totalAmount: 95000,
                status: 'processing',
                notes: 'Hàng giá trị cao',
                createdBy: users[2].id
            },
            {
                orderCode: 'ORD001004',
                senderName: 'Đặng Văn G',
                senderPhone: '0123456792',
                senderAddress: '147 Đường PQR, Quận 7, TP.HCM',
                receiverName: 'Bùi Thị H',
                receiverPhone: '0987654324',
                receiverAddress: '258 Đường STU, Quận 8, TP.HCM',
                serviceTypeId: serviceTypes[2].id,
                weight: 3.8,
                isFragile: true,
                isValuable: true,
                totalAmount: 125000,
                status: 'pending',
                notes: 'Giao hàng liên tỉnh',
                createdBy: users[1].id
            },
            {
                orderCode: 'ORD001005',
                senderName: 'Phan Văn I',
                senderPhone: '0123456793',
                senderAddress: '369 Đường VWX, Quận 9, TP.HCM',
                receiverName: 'Ngô Thị K',
                receiverPhone: '0987654325',
                receiverAddress: '741 Đường YZA, Quận 10, TP.HCM',
                serviceTypeId: serviceTypes[0].id,
                weight: 0.8,
                isFragile: false,
                isValuable: false,
                totalAmount: 12000,
                status: 'cancelled',
                notes: 'Khách hàng hủy đơn',
                createdBy: users[2].id
            },
            {
                orderCode: 'ORD001006',
                senderName: 'Võ Văn L',
                senderPhone: '0123456794',
                senderAddress: '852 Đường BCD, Quận 11, TP.HCM',
                receiverName: 'Đinh Thị M',
                receiverPhone: '0987654326',
                receiverAddress: '963 Đường EFG, Quận 12, TP.HCM',
                serviceTypeId: serviceTypes[1].id,
                weight: 2.1,
                isFragile: false,
                isValuable: false,
                totalAmount: 42000,
                status: 'delivered',
                notes: 'Giao hàng nhanh thành công',
                createdBy: users[1].id
            },
            {
                orderCode: 'ORD001007',
                senderName: 'Trương Văn N',
                senderPhone: '0123456795',
                senderAddress: '159 Đường HIJ, Quận Bình Thạnh, TP.HCM',
                receiverName: 'Lý Thị O',
                receiverPhone: '0987654327',
                receiverAddress: '357 Đường KLM, Quận Tân Bình, TP.HCM',
                serviceTypeId: serviceTypes[2].id,
                weight: 6.2,
                isFragile: false,
                isValuable: false,
                totalAmount: 124000,
                status: 'shipping',
                notes: 'Đang giao hàng liên tỉnh',
                createdBy: users[2].id
            },
            {
                orderCode: 'ORD001008',
                senderName: 'Hồ Văn P',
                senderPhone: '0123456796',
                senderAddress: '753 Đường NOP, Quận Phú Nhuận, TP.HCM',
                receiverName: 'Tôn Thị Q',
                receiverPhone: '0987654328',
                receiverAddress: '951 Đường QRS, Quận Thủ Đức, TP.HCM',
                serviceTypeId: serviceTypes[0].id,
                weight: 4.7,
                isFragile: true,
                isValuable: false,
                totalAmount: 61000,
                status: 'processing',
                notes: 'Chuẩn bị giao hàng',
                createdBy: users[1].id
            },
            {
                orderCode: 'ORD001009',
                senderName: 'Cao Văn R',
                senderPhone: '0123456797',
                senderAddress: '246 Đường TUV, Quận Gò Vấp, TP.HCM',
                receiverName: 'Lâm Thị S',
                receiverPhone: '0987654329',
                receiverAddress: '468 Đường WXY, Quận Bình Tân, TP.HCM',
                serviceTypeId: serviceTypes[3].id,
                weight: 0.5,
                isFragile: false,
                isValuable: true,
                totalAmount: 600000,
                status: 'pending',
                notes: 'Giao hàng quốc tế',
                createdBy: users[0].id
            },
            {
                orderCode: 'ORD001010',
                senderName: 'Dương Văn T',
                senderPhone: '0123456798',
                senderAddress: '135 Đường ZAB, Quận Tân Phú, TP.HCM',
                receiverName: 'Chu Thị U',
                receiverPhone: '0987654330',
                receiverAddress: '579 Đường CDE, Quận Hóc Môn, TP.HCM',
                serviceTypeId: serviceTypes[1].id,
                weight: 1.8,
                isFragile: false,
                isValuable: false,
                totalAmount: 36000,
                status: 'delivered',
                notes: 'Giao hàng nhanh hoàn thành',
                createdBy: users[2].id
            }
        ]);

        console.log('✅ Sample orders created:', orders.length);

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample accounts:');
        console.log('Admin: admin / admin123');
        console.log('Staff: staff1 / staff123');
        console.log('Shipper: shipper1 / shipper123');
        console.log('\n🚀 You can now start the application with: npm start');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedData()
        .then(() => {
            console.log('✅ Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedData;
