// server.js (Corrected Version)
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const Certificate = require('./models/certificateModel');
const Student = require('./models/studentModel'); 
const { normalizeName } = require('./services/utils');
// The new, correct line
const { processCertificate } = require('./services/parser');
// V-- CHANGE THIS LINE --V
const { parseCertificateText } = require('./services/parser'); // Use the new controller function
const app = express();
const port = 3000;

// --- Database Connection ---
mongoose.connect('mongodb://127.0.0.1:27017/certiscanDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder
app.use('/scripts/jspdf', express.static(__dirname + '/node_modules/jspdf/dist/'));
app.use('/scripts/jspdf-autotable', express.static(__dirname + '/node_modules/jspdf-autotable/dist/'));
app.use('/scripts/xlsx', express.static(path.join(__dirname, 'node_modules/xlsx/dist/')));
// --- Multer Setup for File Storage ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// server.js

// Require the new Student model at the top


// server.js

// --- Replace the ENTIRE /upload route with this ---
// server.js

app.post('/upload', upload.single('certificate'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const imagePath = path.join(__dirname, req.file.path);
    console.log(`Processing file: ${imagePath}`);

    try {
        // --- Step 1: Get the list of ALL known students from the database ---
        const allStudents = await Student.find({});
        if (allStudents.length === 0) {
            return res.status(500).send('No students found in the database. Please add students first.');
        }

        // --- Step 2: OCR and Pre-processing ---
        const image = await Jimp.read(imagePath);
        await image.greyscale().contrast(0.5).writeAsync(imagePath);
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', { psm: Tesseract.PSM.SINGLE_BLOCK });
        console.log("--- Raw OCR Text ---");
        console.log(text);

        // --- Step 3: Process the certificate to find the student and details ---
        const result = processCertificate(text, allStudents);

        if (!result) {
            return res.status(400).json({ message: 'Could not find a known student in this certificate.' });
        }

        console.log("--- Processed Data ---");
        console.log(result);
        
        const { student, ...parsedDetails } = result;

        // --- STEP 4: NEW - CHECK FOR DUPLICATE CERTIFICATE ---
        console.log("Checking for duplicate certificate...");
        
        let existingCertificate = null;
        const { credentialID, courseName } = parsedDetails;

        if (credentialID) {
            // Priority 1: Check by credential ID for this student.
            existingCertificate = await Certificate.findOne({
                student: student._id,
                credentialID: credentialID
            });
            if (existingCertificate) console.log("Duplicate found based on Credential ID.");
        }

        if (!existingCertificate && courseName) {
            // Priority 2 (fallback): Check by course name for this student.
            existingCertificate = await Certificate.findOne({
                student: student._id,
                courseName: courseName
            });
            if (existingCertificate) console.log("Duplicate found based on Course Name.");
        }

        // If a duplicate was found, reject the upload.
        if (existingCertificate) {
            return res.status(409).json({ message: 'This exact certificate has already been uploaded for this student.' });
        }

        console.log("No duplicate found. Proceeding to save.");
        // --- End of Duplicate Check ---


        // --- Step 5: Save the new certificate, linking it to the found student ---
        const certificateData = new Certificate({
            student: student._id, // Link to the student's ID
            ...parsedDetails,     // Spread all other parsed details like courseName, credentialID, etc.
            originalFilename: req.file.originalname,
            filePath: req.file.path,
            rawText: text
        });

        await certificateData.save();

        res.status(201).json({
            message: `Certificate saved for student ${student.displayName}!`,
            data: certificateData
        });

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing the certificate.');
    }
});


// server.js

// ... after your /upload and /certificates routes ...

// --- The Special Feature: Get all certificates for a specific student ---
app.get('/students/:studentName/certificates', async (req, res) => {
    try {
        const studentName = req.params.studentName;

        // Find the student by name
        const student = await Student.findOne({ name: studentName });

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Find all certificates that reference this student's ID
        const certificates = await Certificate.find({ student: student._id });

        res.json({
            student: student,
            certificates: certificates
        });

    } catch (error) {
        console.error('Error fetching certificates for student:', error);
        res.status(500).send('Server error.');
    }
});
// app.get('/students/certificates/:rollNo', async (req, res) => {
//     try {
//         const { rollNo } = req.params;

//         // Find the student by their roll number
//         const student = await Student.findOne({ rollNo: rollNo });

//         if (!student) {
//             return res.status(404).json({ message: 'No student found with that roll number.' });
//         }

//         // Find all certificates that belong to this student
//         const certificates = await Certificate.find({ student: student._id }).sort({ createdAt: -1 });

//         // Send back both the student's info and their certificates
//         res.json({
//             student: student,
//             certificates: certificates
//         });

//     } catch (error) {
//         console.error("Error fetching report:", error);
//         res.status(500).json({ message: 'Server error while fetching report.' });
//     }
// });

// Route to get all certificates
app.get('/certificates', async (req, res) => {
    try {
        const certificates = await Certificate.find();
        res.json(certificates);
    } catch (error) {
        res.status(500).send('Error retrieving certificates.');
    }
});
app.use(express.json());

// --- ADD THIS NEW ROUTE ---

app.get('/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ displayName: 1 }); // Sort alphabetically
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve students.' });
    }
});

// --- UPDATE (EDIT) A STUDENT ---
app.post('/students', async (req, res) => {
    try {
        const { displayName, rollNo } = req.body; // <-- Get rollNo from body

        if (!displayName || !rollNo) {
            return res.status(400).json({ message: 'Both name and roll number are required.' });
        }

        // Check if a student with this roll number already exists
        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(409).json({ message: `A student with roll number '${rollNo}' already exists.` });
        }

        const normalizedName = normalizeName(displayName);
        
        const newStudent = new Student({
            displayName: displayName.trim(),
            rollNo: rollNo.trim(),
            normalizedName: normalizedName
        });
        await newStudent.save();

        res.status(201).json({ 
            message: `Successfully added student: ${newStudent.displayName}`,
            student: newStudent 
        });

    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error while adding student.' });
    }
});


// --- UPDATE the PUT /students/:id route ---
app.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { displayName, rollNo } = req.body; // <-- Get rollNo from body

        if (!displayName || !rollNo) {
            return res.status(400).json({ message: 'Both name and roll number are required.' });
        }

        // Check if another student has this roll number
        const existingStudent = await Student.findOne({ rollNo, _id: { $ne: id } });
        if (existingStudent) {
            return res.status(409).json({ message: `Another student with roll number '${rollNo}' already exists.` });
        }
        
        const normalizedName = normalizeName(displayName);
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { 
                displayName: displayName.trim(),
                rollNo: rollNo.trim(),
                normalizedName 
            },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.json({ message: 'Student updated successfully!', student: updatedStudent });

    } catch (error) {
        res.status(500).json({ message: 'Server error while updating student.' });
    }
});
app.get('/students/certificates/:rollNo', async (req, res) => {
    try {
        const { rollNo } = req.params;

        // Find the student by their roll number
        const student = await Student.findOne({ rollNo: rollNo });

        if (!student) {
            return res.status(404).json({ message: 'No student found with that roll number.' });
        }

        // Find all certificates that belong to this student
        const certificates = await Certificate.find({ student: student._id }).sort({ createdAt: -1 });

        res.json({
            student: student,
            certificates: certificates
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching report.' });
    }
});
// server.js

// ... after your other routes ...

// --- GET ALL CERTIFICATES WITH POPULATED STUDENT DATA ---
app.get('/certificates/all', async (req, res) => {
    try {
        // Use .populate('student') to automatically fetch the linked student's
        // details (name, roll no) for each certificate.
        const certificates = await Certificate.find()
            .populate('student') 
            .sort({ createdAt: -1 });

        res.json(certificates);
    } catch (error) {
        console.error("Error fetching all certificates:", error);
        res.status(500).json({ message: 'Server error while fetching all certificates.' });
    }
});
// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});