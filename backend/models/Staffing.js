const mongoose = require('mongoose');

const staffingSchema = new mongoose.Schema({
    staff_type: {
        type: String,
        required: true,
        enum: [ 'doctor', 'nurse', 'support_staff' ]
    },
    current_count: {
        type: Number,
        required: true,
        default: 0
    },
    available_count: {
        type: Number,
        required: true,
        default: 0
    },
    on_shift_count: {
        type: Number,
        required: true,
        default: 0
    },
    on_leave_count: {
        type: Number,
        required: true,
        default: 0
    },
    department: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true,
        enum: [ 'morning', 'evening', 'night' ]
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

module.exports = mongoose.model('Staffing', staffingSchema);
