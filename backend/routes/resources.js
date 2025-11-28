const express = require('express');
const router = express.Router();
const Staffing = require('../models/Staffing');
const Inventory = require('../models/Inventory');
const BedCapacity = require('../models/BedCapacity');

// ========== STAFFING ROUTES ==========

// GET /api/resources/staffing
router.get('/staffing', async (req, res) => {
    try {
        const { department, shift } = req.query;

        const filter = {};
        if (department) filter.department = department;
        if (shift) filter.shift = shift;

        const staffing = await Staffing.find(filter);

        res.json({
            success: true,
            data: staffing
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/resources/staffing
router.post('/staffing', async (req, res) => {
    try {
        const { staff_type, department, shift } = req.body;

        // Check if record exists
        const existing = await Staffing.findOne({
            staff_type,
            department,
            shift
        });

        let staffing;
        if (existing) {
            // Update existing
            Object.assign(existing, req.body, { last_updated: Date.now() });
            staffing = await existing.save();
        } else {
            // Create new
            staffing = new Staffing(req.body);
            await staffing.save();
        }

        res.json({
            success: true,
            message: 'Staffing data updated',
            data: staffing
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========== INVENTORY ROUTES ==========

// GET /api/resources/inventory
router.get('/inventory', async (req, res) => {
    try {
        const { category, low_stock } = req.query;

        const filter = {};
        if (category) filter.category = category;

        let inventory = await Inventory.find(filter);

        // Add status field
        inventory = inventory.map(item => {
            const itemObj = item.toObject();
            itemObj.status = item.current_stock < item.reorder_level ? 'low' : 'normal';
            return itemObj;
        });

        // Filter low stock if requested
        if (low_stock === 'true') {
            inventory = inventory.filter(item => item.status === 'low');
        }

        const low_stock_count = inventory.filter(item => item.status === 'low').length;

        res.json({
            success: true,
            data: inventory,
            low_stock_count
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/resources/inventory
router.post('/inventory', async (req, res) => {
    try {
        const { item_name, location } = req.body;

        // Check if item exists
        const existing = await Inventory.findOne({
            item_name,
            location
        });

        let inventory;
        if (existing) {
            // Update existing
            Object.assign(existing, req.body, { last_updated: Date.now() });
            inventory = await existing.save();
        } else {
            // Create new
            inventory = new Inventory(req.body);
            await inventory.save();
        }

        res.json({
            success: true,
            message: 'Inventory updated',
            data: inventory
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========== BED CAPACITY ROUTES ==========

// GET /api/resources/capacity
router.get('/capacity', async (req, res) => {
    try {
        const { ward_type } = req.query;

        const filter = {};
        if (ward_type) filter.ward_type = ward_type;

        let capacity = await BedCapacity.find(filter);

        // Calculate occupancy rate
        capacity = capacity.map(bed => {
            const bedObj = bed.toObject();
            bedObj.occupancy_rate = Math.round((bed.occupied_beds / bed.total_beds) * 100);
            return bedObj;
        });

        const total_available = capacity.reduce((sum, bed) => sum + bed.available_beds, 0);

        res.json({
            success: true,
            data: capacity,
            total_available
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/resources/capacity
router.post('/capacity', async (req, res) => {
    try {
        const { ward_type } = req.body;

        // Check if record exists
        const existing = await BedCapacity.findOne({
            ward_type
        });

        let capacity;
        if (existing) {
            // Update existing
            Object.assign(existing, req.body, { last_updated: Date.now() });
            capacity = await existing.save();
        } else {
            // Create new
            capacity = new BedCapacity(req.body);
            await capacity.save();
        }

        res.json({
            success: true,
            message: 'Bed capacity updated',
            data: capacity
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
