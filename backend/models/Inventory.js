const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    item_name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [ 'medicine', 'equipment', 'ppe', 'supplies' ]
    },
    current_stock: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        enum: [ 'pieces', 'boxes', 'bottles' ]
    },
    reorder_level: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true,
        enum: [ 'pharmacy', 'store', 'ward' ]
    },
    expiry_date: {
        type: Date
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Inventory', inventorySchema);
