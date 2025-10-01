const { ServiceType, Pricing } = require('../models');
const { authenticateToken, authorizeRoles, validateRequest } = require('../middleware/auth');

const router = require('express').Router();

// ========== SERVICE TYPES ROUTES ==========

// Get all service types
router.get('/service-types',
  authenticateToken,
  async (req, res) => {
    try {
      const serviceTypes = await ServiceType.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: { serviceTypes }
      });
    } catch (error) {
      console.error('Get service types error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service types'
      });
    }
  }
);

// Get all service types with pagination (Admin only)
router.get('/service-types/admin',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        whereClause[require('sequelize').Op.or] = [
          { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: serviceTypes } = await ServiceType.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          serviceTypes,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get service types admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service types'
      });
    }
  }
);

// Create service type
router.post('/service-types',
  authenticateToken,
  authorizeRoles('admin'),
  validateRequest({
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 500 }
  }),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      const serviceType = await ServiceType.create({
        name,
        description
      });

      res.status(201).json({
        success: true,
        message: 'Service type created successfully',
        data: { serviceType }
      });
    } catch (error) {
      console.error('Create service type error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create service type'
      });
    }
  }
);

// Update service type
router.put('/service-types/:id',
  authenticateToken,
  authorizeRoles('admin'),
  validateRequest({
    name: { minLength: 2, maxLength: 100 },
    description: { maxLength: 500 }
  }),
  async (req, res) => {
    try {
      const { name, description, isActive } = req.body;
      const serviceType = await ServiceType.findByPk(req.params.id);

      if (!serviceType) {
        return res.status(404).json({
          success: false,
          message: 'Service type not found'
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;

      await serviceType.update(updateData);

      res.json({
        success: true,
        message: 'Service type updated successfully',
        data: { serviceType }
      });
    } catch (error) {
      console.error('Update service type error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service type'
      });
    }
  }
);

// Delete service type
router.delete('/service-types/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const serviceType = await ServiceType.findByPk(req.params.id);

      if (!serviceType) {
        return res.status(404).json({
          success: false,
          message: 'Service type not found'
        });
      }

      // Check if service type has pricing rules
      const pricingCount = await Pricing.count({
        where: { serviceTypeId: serviceType.id }
      });

      if (pricingCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete service type with existing pricing rules'
        });
      }

      await serviceType.destroy();

      res.json({
        success: true,
        message: 'Service type deleted successfully'
      });
    } catch (error) {
      console.error('Delete service type error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete service type'
      });
    }
  }
);

// ========== PRICING ROUTES ==========

// Get pricing rules for a service type
router.get('/service-types/:serviceTypeId/pricing',
  authenticateToken,
  async (req, res) => {
    try {
      const pricingRules = await Pricing.findAll({
        where: { 
          serviceTypeId: req.params.serviceTypeId,
          isActive: true 
        },
        order: [['weightFrom', 'ASC']]
      });

      res.json({
        success: true,
        data: { pricingRules }
      });
    } catch (error) {
      console.error('Get pricing rules error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pricing rules'
      });
    }
  }
);

// Get all pricing rules (Admin only)
router.get('/pricing',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, serviceTypeId } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (serviceTypeId) whereClause.serviceTypeId = serviceTypeId;

      const { count, rows: pricingRules } = await Pricing.findAndCountAll({
        where: whereClause,
        include: [{
          model: ServiceType,
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          pricingRules,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get pricing rules admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pricing rules'
      });
    }
  }
);

// Create pricing rule
router.post('/pricing',
  authenticateToken,
  authorizeRoles('admin'),
  validateRequest({
    serviceTypeId: { required: true },
    weightFrom: { required: true },
    weightTo: { required: true },
    price: { required: true }
  }),
  async (req, res) => {
    try {
      const { serviceTypeId, weightFrom, weightTo, price, fragilePrice, valuablePrice } = req.body;

      // Validate service type exists
      const serviceType = await ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        return res.status(404).json({
          success: false,
          message: 'Service type not found'
        });
      }

      // Validate weight range
      if (parseFloat(weightFrom) >= parseFloat(weightTo)) {
        return res.status(400).json({
          success: false,
          message: 'Weight from must be less than weight to'
        });
      }

      // Check for overlapping weight ranges
      const overlappingRule = await Pricing.findOne({
        where: {
          serviceTypeId,
          isActive: true,
          [require('sequelize').Op.or]: [
            {
              weightFrom: { [require('sequelize').Op.lte]: parseFloat(weightTo) },
              weightTo: { [require('sequelize').Op.gte]: parseFloat(weightFrom) }
            }
          ]
        }
      });

      if (overlappingRule) {
        return res.status(400).json({
          success: false,
          message: 'Weight range overlaps with existing pricing rule'
        });
      }

      const pricingRule = await Pricing.create({
        serviceTypeId,
        weightFrom: parseFloat(weightFrom),
        weightTo: parseFloat(weightTo),
        price: parseFloat(price),
        fragilePrice: fragilePrice ? parseFloat(fragilePrice) : null,
        valuablePrice: valuablePrice ? parseFloat(valuablePrice) : null
      });

      res.status(201).json({
        success: true,
        message: 'Pricing rule created successfully',
        data: { pricingRule }
      });
    } catch (error) {
      console.error('Create pricing rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create pricing rule'
      });
    }
  }
);

// Update pricing rule
router.put('/pricing/:id',
  authenticateToken,
  authorizeRoles('admin'),
  validateRequest({
    weightFrom: { required: false },
    weightTo: { required: false },
    price: { required: false }
  }),
  async (req, res) => {
    try {
      const { weightFrom, weightTo, price, fragilePrice, valuablePrice, isActive } = req.body;
      const pricingRule = await Pricing.findByPk(req.params.id);

      if (!pricingRule) {
        return res.status(404).json({
          success: false,
          message: 'Pricing rule not found'
        });
      }

      // Validate weight range if provided
      if (weightFrom && weightTo && parseFloat(weightFrom) >= parseFloat(weightTo)) {
        return res.status(400).json({
          success: false,
          message: 'Weight from must be less than weight to'
        });
      }

      const updateData = {};
      if (weightFrom !== undefined) updateData.weightFrom = parseFloat(weightFrom);
      if (weightTo !== undefined) updateData.weightTo = parseFloat(weightTo);
      if (price !== undefined) updateData.price = parseFloat(price);
      if (fragilePrice !== undefined) updateData.fragilePrice = fragilePrice ? parseFloat(fragilePrice) : null;
      if (valuablePrice !== undefined) updateData.valuablePrice = valuablePrice ? parseFloat(valuablePrice) : null;
      if (isActive !== undefined) updateData.isActive = isActive;

      await pricingRule.update(updateData);

      res.json({
        success: true,
        message: 'Pricing rule updated successfully',
        data: { pricingRule }
      });
    } catch (error) {
      console.error('Update pricing rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update pricing rule'
      });
    }
  }
);

// Delete pricing rule
router.delete('/pricing/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const pricingRule = await Pricing.findByPk(req.params.id);

      if (!pricingRule) {
        return res.status(404).json({
          success: false,
          message: 'Pricing rule not found'
        });
      }

      await pricingRule.destroy();

      res.json({
        success: true,
        message: 'Pricing rule deleted successfully'
      });
    } catch (error) {
      console.error('Delete pricing rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete pricing rule'
      });
    }
  }
);

// Calculate shipping cost
router.post('/calculate-cost',
  authenticateToken,
  async (req, res) => {
    try {
      const { serviceTypeId, weight, isFragile, isValuable } = req.body;

      if (!serviceTypeId || !weight) {
        return res.status(400).json({
          success: false,
          message: 'Service type ID and weight are required'
        });
      }

      const pricingRule = await Pricing.findOne({
        where: {
          serviceTypeId,
          isActive: true,
          weightFrom: { [require('sequelize').Op.lte]: parseFloat(weight) },
          weightTo: { [require('sequelize').Op.gte]: parseFloat(weight) }
        }
      });

      if (!pricingRule) {
        return res.status(404).json({
          success: false,
          message: 'No pricing rule found for this weight range'
        });
      }

      let totalCost = parseFloat(pricingRule.price) * parseFloat(weight);

      if (isFragile && pricingRule.fragilePrice) {
        totalCost += parseFloat(pricingRule.fragilePrice);
      }

      if (isValuable && pricingRule.valuablePrice) {
        totalCost += parseFloat(pricingRule.valuablePrice);
      }

      res.json({
        success: true,
        data: {
          basePrice: pricingRule.price,
          weight: parseFloat(weight),
          fragileFee: isFragile ? pricingRule.fragilePrice : 0,
          valuableFee: isValuable ? pricingRule.valuablePrice : 0,
          totalCost: Math.round(totalCost * 100) / 100
        }
      });
    } catch (error) {
      console.error('Calculate cost error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate shipping cost'
      });
    }
  }
);

module.exports = router;
