// models/certificateModel.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    // REMOVED: The 'name' field is no longer needed here.
    
    // ADDED: A reference to the Student model
    student: {
        type: mongoose.Schema.Types.ObjectId, // This stores the student's unique _id
        ref: 'Student', // This tells Mongoose the ID refers to a document in the 'Student' collection
        required: true
    },

    // --- All other fields remain the same ---
    organization: { type: String, trim: true },
    courseName: { type: String, trim: true },
    credentialID: { type: String, trim: true, sparse: true },
    issuedDate: { type: Date },
    // ... etc.

    originalFilename: { type: String, required: true },
    filePath: { type: String, required: true },
    rawText: { type: String }
}, { timestamps: true });

certificateSchema.index({ credentialID: 1 }, { unique: true, sparse: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
// **Important Index Fix**: This allows multiple documents to have a null credentialID,
// but ensures that any ID that *does* exist is unique.

module.exports = Certificate;