const { User } = require('../models');
const { authenticateToken, authorizeRoles, validateRequest } = require('../middleware/auth');

const router = require('express').Router();

// Get all users (Admin only)
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (role) whereClause.role = role;
      if (search) {
        whereClause[require('sequelize').Op.or] = [
          { fullName: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { username: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }
);

// Get user by ID
router.get('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user'
      });
    }
  }
);

// Create new user
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  validateRequest({
    username: { required: true, minLength: 3, maxLength: 50 },
    email: { required: true, email: true },
    password: { required: true, minLength: 6 },
    fullName: { required: true, minLength: 2, maxLength: 100 },
    phone: { phone: true },
    role: { required: true }
  }),
  async (req, res) => {
    try {
      const { username, email, password, fullName, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // Validate role
      if (!['admin', 'staff', 'shipper'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      const user = await User.create({
        username,
        email,
        password,
        fullName,
        phone,
        role
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }
);

// Update user
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  validateRequest({
    fullName: { minLength: 2, maxLength: 100 },
    phone: { phone: true },
    role: { required: false }
  }),
  async (req, res) => {
    try {
      const { fullName, phone, role, isActive } = req.body;
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Validate role if provided
      if (role && !['admin', 'staff', 'shipper'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (phone !== undefined) updateData.phone = phone;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);

// Delete user
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
);

// Toggle user active status
router.patch('/:id/toggle-status',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deactivating themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      await user.update({ isActive: !user.isActive });

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          user: {
            id: user.id,
            username: user.username,
            isActive: user.isActive
          }
        }
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle user status'
      });
    }
  }
);

module.exports = router;
