const mongoose = require('mongoose');

const bedCapacitySchema = new mongoose.Schema({
    ward_type: {
        type: String,
        required: true,
        enum: [ 'general', 'icu', 'emergency', 'isolation' ]
    },
    total_beds: {
        type: Number,
        required: true
    },
    occupied_beds: {
        type: Number,
        required: true,
        default: 0
    },
    available_beds: {
        type: Number,
        required: true
    },
    reserved_beds: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('BedCapacity', bedCapacitySchema);
