const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    supplier_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    contact_person: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    items_supplied: [ {
        type: String
    } ],
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    delivery_time_avg: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Supplier', supplierSchema);
