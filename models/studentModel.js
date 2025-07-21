// models/studentModel.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    rollNo: { // <-- ADD THIS NEW FIELD
        type: String,
        required: true,
        trim: true,
        unique: true // This is the new unique identifier
    },
    // The normalizedName is still useful for flexible searching, but not as the primary key.
    normalizedName: {
        type: String,
        required: true,
        index: true
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;