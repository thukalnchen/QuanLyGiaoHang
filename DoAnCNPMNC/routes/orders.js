const { Order, ServiceType, User } = require('../models');
const { authenticateToken, authorizeRoles, validateRequest } = require('../middleware/auth');

const router = require('express').Router();

// Generate unique order code
const generateOrderCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Get all orders with search and filter
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        serviceTypeId,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Search by order code, sender/receiver name or phone
      if (search) {
        whereClause[require('sequelize').Op.or] = [
          { orderCode: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { senderName: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { receiverName: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { senderPhone: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { receiverPhone: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status) {
        whereClause.status = status;
      }

      // Filter by service type
      if (serviceTypeId) {
        whereClause.serviceTypeId = serviceTypeId;
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) {
          whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo);
        }
      }

      // Staff and shipper can only see their own orders
      if (req.user.role === 'staff' || req.user.role === 'shipper') {
        whereClause.createdBy = req.user.id;
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ServiceType,
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'username', 'fullName']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get orders'
      });
    }
  }
);

// Get order by ID
router.get('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const whereClause = { id: req.params.id };

      // Staff and shipper can only see their own orders
      if (req.user.role === 'staff' || req.user.role === 'shipper') {
        whereClause.createdBy = req.user.id;
      }

      const order = await Order.findOne({
        where: whereClause,
        include: [
          {
            model: ServiceType,
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'username', 'fullName']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order'
      });
    }
  }
);

// Create new order
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  validateRequest({
    senderName: { required: true, minLength: 2, maxLength: 100 },
    senderPhone: { required: true, phone: true },
    senderAddress: { required: true, minLength: 10 },
    receiverName: { required: true, minLength: 2, maxLength: 100 },
    receiverPhone: { required: true, phone: true },
    receiverAddress: { required: true, minLength: 10 },
    serviceTypeId: { required: true },
    weight: { required: true }
  }),
  async (req, res) => {
    try {
      const {
        senderName,
        senderPhone,
        senderAddress,
        receiverName,
        receiverPhone,
        receiverAddress,
        serviceTypeId,
        weight,
        isFragile,
        isValuable,
        notes
      } = req.body;

      // Validate service type exists
      const serviceType = await ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        return res.status(404).json({
          success: false,
          message: 'Service type not found'
        });
      }

      // Calculate total amount (simplified calculation)
      const basePrice = 10000; // Base price per kg
      let totalAmount = basePrice * parseFloat(weight);
      
      if (isFragile) totalAmount += 5000;
      if (isValuable) totalAmount += 10000;

      const order = await Order.create({
        orderCode: generateOrderCode(),
        senderName,
        senderPhone,
        senderAddress,
        receiverName,
        receiverPhone,
        receiverAddress,
        serviceTypeId,
        weight: parseFloat(weight),
        isFragile: isFragile || false,
        isValuable: isValuable || false,
        totalAmount: Math.round(totalAmount * 100) / 100,
        notes,
        createdBy: req.user.id
      });

      // Fetch the created order with relations
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: ServiceType,
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'username', 'fullName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order: createdOrder }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  }
);

// Update order status
router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('admin', 'staff', 'shipper'),
  validateRequest({
    status: { required: true }
  }),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const whereClause = { id: req.params.id };

      // Staff and shipper can only update their own orders
      if (req.user.role === 'staff' || req.user.role === 'shipper') {
        whereClause.createdBy = req.user.id;
      }

      const order = await Order.findOne({ where: whereClause });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      await order.update({ status });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order: {
            id: order.id,
            orderCode: order.orderCode,
            status: order.status,
            updatedAt: order.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
);

// Update order details
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  validateRequest({
    senderName: { minLength: 2, maxLength: 100 },
    senderPhone: { phone: true },
    receiverName: { minLength: 2, maxLength: 100 },
    receiverPhone: { phone: true },
    weight: { required: false }
  }),
  async (req, res) => {
    try {
      const {
        senderName,
        senderPhone,
        senderAddress,
        receiverName,
        receiverPhone,
        receiverAddress,
        weight,
        isFragile,
        isValuable,
        notes
      } = req.body;

      const whereClause = { id: req.params.id };

      // Staff can only update their own orders
      if (req.user.role === 'staff') {
        whereClause.createdBy = req.user.id;
      }

      const order = await Order.findOne({ where: whereClause });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Only allow updates for pending orders
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending orders can be updated'
        });
      }

      const updateData = {};
      if (senderName) updateData.senderName = senderName;
      if (senderPhone) updateData.senderPhone = senderPhone;
      if (senderAddress) updateData.senderAddress = senderAddress;
      if (receiverName) updateData.receiverName = receiverName;
      if (receiverPhone) updateData.receiverPhone = receiverPhone;
      if (receiverAddress) updateData.receiverAddress = receiverAddress;
      if (weight !== undefined) updateData.weight = parseFloat(weight);
      if (isFragile !== undefined) updateData.isFragile = isFragile;
      if (isValuable !== undefined) updateData.isValuable = isValuable;
      if (notes !== undefined) updateData.notes = notes;

      // Recalculate total amount if weight or flags changed
      if (weight !== undefined || isFragile !== undefined || isValuable !== undefined) {
        const basePrice = 10000;
        let totalAmount = basePrice * parseFloat(weight || order.weight);
        
        if (isFragile !== undefined ? isFragile : order.isFragile) totalAmount += 5000;
        if (isValuable !== undefined ? isValuable : order.isValuable) totalAmount += 10000;
        
        updateData.totalAmount = Math.round(totalAmount * 100) / 100;
      }

      await order.update(updateData);

      res.json({
        success: true,
        message: 'Order updated successfully',
        data: { order }
      });
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order'
      });
    }
  }
);

// Delete order
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Only allow deletion of pending orders
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending orders can be deleted'
        });
      }

      await order.destroy();

      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete order'
      });
    }
  }
);

// Get order statistics
router.get('/stats/overview',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const whereClause = {};
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) {
          whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo);
        }
      }

      const totalOrders = await Order.count({ where: whereClause });
      const totalRevenue = await Order.sum('totalAmount', { where: whereClause });
      
      const statusStats = await Order.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', '*'), 'count']
        ],
        where: whereClause,
        group: ['status']
      });

      const serviceTypeStats = await Order.findAll({
        attributes: [
          'serviceTypeId',
          [require('sequelize').fn('COUNT', '*'), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('totalAmount')), 'revenue']
        ],
        where: whereClause,
        include: [{
          model: ServiceType,
          attributes: ['name']
        }],
        group: ['serviceTypeId', 'ServiceType.id']
      });

      res.json({
        success: true,
        data: {
          totalOrders,
          totalRevenue: totalRevenue || 0,
          statusStats,
          serviceTypeStats
        }
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order statistics'
      });
    }
  }
);

module.exports = router;
