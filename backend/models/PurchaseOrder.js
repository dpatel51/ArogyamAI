const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    supplier_id: {
        type: String,
        required: true
    },
    items: [ {
        item_name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit_price: {
            type: Number,
            required: true
        },
        total_price: {
            type: Number,
            required: true
        }
    } ],
    total_amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: [ 'pending', 'approved', 'ordered', 'delivered' ],
        default: 'pending'
    },
    priority: {
        type: String,
        required: true,
        enum: [ 'urgent', 'normal', 'low' ],
        default: 'normal'
    },
    requested_by: {
        type: String,
        required: true
    },
    requested_date: {
        type: Date,
        default: Date.now
    },
    expected_delivery: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
