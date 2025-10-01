const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'shipper'),
    allowNull: false,
    defaultValue: 'staff'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password && !user.password.startsWith('$2a$')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Service Type Model
const ServiceType = sequelize.define('ServiceType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'service_types',
  timestamps: true
});

// Pricing Model
const Pricing = sequelize.define('Pricing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  serviceTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServiceType,
      key: 'id'
    }
  },
  weightFrom: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Weight from (kg)'
  },
  weightTo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Weight to (kg)'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price per kg'
  },
  fragilePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Additional price for fragile items'
  },
  valuablePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Additional price for valuable items'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'pricing',
  timestamps: true
});

// Order Model
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  senderPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  senderAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  receiverName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  receiverPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  receiverAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  serviceTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServiceType,
      key: 'id'
    }
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isFragile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isValuable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipping', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'orders',
  timestamps: true
});

// Define associations
ServiceType.hasMany(Pricing, { foreignKey: 'serviceTypeId' });
Pricing.belongsTo(ServiceType, { foreignKey: 'serviceTypeId' });

ServiceType.hasMany(Order, { foreignKey: 'serviceTypeId' });
Order.belongsTo(ServiceType, { foreignKey: 'serviceTypeId' });

User.hasMany(Order, { foreignKey: 'createdBy' });
Order.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = {
  User,
  ServiceType,
  Pricing,
  Order,
  sequelize
};
