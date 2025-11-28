const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');

// ========== PURCHASE ORDER ROUTES ==========

// GET /api/procurement/orders
router.get('/orders', async (req, res) => {
    try {
        const { status, priority } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const orders = await PurchaseOrder.find(filter).sort({ created_at: -1 });

        // Format response with basic info
        const formattedOrders = await Promise.all(orders.map(async (order) => {
            const supplier = await Supplier.findOne({ supplier_id: order.supplier_id });
            return {
                order_id: order.order_id,
                supplier_name: supplier ? supplier.name : 'Unknown',
                total_amount: order.total_amount,
                status: order.status,
                items_count: order.items.length,
                requested_date: order.requested_date,
                priority: order.priority
            };
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/procurement/orders/:order_id
router.get('/orders/:order_id', async (req, res) => {
    try {
        const order = await PurchaseOrder.findOne({ order_id: req.params.order_id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const supplier = await Supplier.findOne({ supplier_id: order.supplier_id });

        res.json({
            success: true,
            data: {
                order_id: order.order_id,
                items: order.items,
                total_amount: order.total_amount,
                status: order.status,
                priority: order.priority,
                requested_by: order.requested_by,
                requested_date: order.requested_date,
                expected_delivery: order.expected_delivery,
                supplier: supplier || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/procurement/orders
router.post('/orders', async (req, res) => {
    try {
        const { supplier_id, items, priority, requested_by } = req.body;

        // Validate required fields
        if (!supplier_id || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'supplier_id and items are required'
            });
        }

        // Calculate total for each item and overall total
        const itemsWithTotal = items.map(item => ({
            ...item,
            total_price: item.quantity * item.unit_price
        }));

        const total_amount = itemsWithTotal.reduce((sum, item) => sum + item.total_price, 0);

        // Generate order ID
        const count = await PurchaseOrder.countDocuments();
        const order_id = `PO-2024-${String(count + 1).padStart(3, '0')}`;

        // Create purchase order
        const order = new PurchaseOrder({
            order_id,
            supplier_id,
            items: itemsWithTotal,
            total_amount,
            priority: priority || 'normal',
            requested_by: requested_by || 'Admin',
            status: 'pending'
        });

        await order.save();

        res.status(201).json({
            success: true,
            order_id: order.order_id,
            message: 'Purchase order created',
            data: order
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PATCH /api/procurement/orders/:order_id
router.patch('/orders/:order_id', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'status is required' });
        }

        const order = await PurchaseOrder.findOneAndUpdate(
            { order_id: req.params.order_id },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // If status is 'approved', update inventory for each item in the order
        if (status === 'approved') {
            for (const item of order.items) {
                await Inventory.findOneAndUpdate(
                    { item_name: item.item_name },
                    {
                        $inc: { current_stock: item.quantity },
                        $set: { last_updated: new Date() }
                    }
                );
            }
        }

        res.json({
            success: true,
            message: `Order ${status}`,
            data: order
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========== SUPPLIER ROUTES ==========

// GET /api/procurement/suppliers
router.get('/suppliers', async (req, res) => {
    try {

        // const { item_type } = req.query;

        // console.log('Supplier: item type', item_type);
        // console.log({ item_type });

        // const filter = { is_active: true };
        // if (item_type) {
        //     filter.items_supplied = item_type;
        // }

        const suppliers = await Supplier.find();

        const formattedSuppliers = suppliers.map(supplier => ({
            supplier_id: supplier.supplier_id,
            name: supplier.name,
            contact_person: supplier.contact_person,
            phone: supplier.phone,
            email: supplier.email,
            items_supplied: supplier.items_supplied,
            rating: supplier.rating,
            avg_delivery_days: supplier.delivery_time_avg
        }));

        res.json({
            success: true,
            data: formattedSuppliers
        });
    } catch (error) {
        console.log('Error in Supplier', error);

        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/procurement/suppliers
router.post('/suppliers', async (req, res) => {
    try {
        const { supplier_id, name, contact_person, phone, email } = req.body;

        if (!supplier_id || !name || !contact_person || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: 'All supplier details are required'
            });
        }

        const supplier = new Supplier(req.body);
        await supplier.save();

        res.status(201).json({
            success: true,
            message: 'Supplier added',
            data: supplier
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
