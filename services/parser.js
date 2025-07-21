// services/parser.js (DEFINITIVE, SIMPLE, AND FINAL)

// This parser is for NPTEL certificates. This logic is stable.
// services/parser.js

function parseNPTEL(text) {
    const data = {};

    // --- Definitive Course Name Parser ---
    // This uses the reliable landmarks to get the block of text.
    const courseBlockRegex = /for successfully completing the course\s*([\s\S]*?)\s*with a consolidated score/i;
    const courseBlockMatch = text.match(courseBlockRegex);

    if (courseBlockMatch && courseBlockMatch[1]) {
        // This is the FIX.
        // From the captured block, find the first real word (3+ letters long)
        // and capture it and everything after it. This ignores leading junk.
        const cleanTitleRegex = /([a-zA-Z]{3,}[\s\S]*)/;
        const cleanTitleMatch = courseBlockMatch[1].match(cleanTitleRegex);

        if (cleanTitleMatch && cleanTitleMatch[1]) {
            // The captured group is clean. We just remove newlines and trim.
            data.courseName = cleanTitleMatch[1].replace(/\n/g, ' ').trim();
        }
    }

    // --- Credential ID Parser (This version is stable) ---
    const credentialRegex = /(NPTEL[A-Z0-9]+)/i;
    const credentialMatch = text.match(credentialRegex);
    if (credentialMatch && credentialMatch[1]) {
        data.credentialID = credentialMatch[1].trim();
    }

    data.organization = 'NPTEL';
    return data;
}

// This parser is for Udemy certificates.
function parseUdemy(text) {
    const data = {};
    const lines = text.split('\n').filter(line => line.trim().length > 2); // Get all non-empty lines

    let studentName = null;
    let studentNameIndex = -1;

    // --- Step 1: Find the student's name and its line number ---
    // A name is a line with exactly two capitalized words.
    const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
    lines.forEach((line, index) => {
        if (nameRegex.test(line.trim())) {
            studentName = line.trim();
            studentNameIndex = index;
        }
    });

    // If we couldn't find a name, we cannot proceed.
    if (!studentName) {
        return null;
    }
    data.name = studentName;


    // --- Step 2: The course title is the block of text BEFORE the student's name ---
    const potentialCourseLines = lines.slice(0, studentNameIndex);
    
    // Filter out junk lines and join the rest to form the title.
    const courseTitle = potentialCourseLines
        .filter(line => line.split(' ').length >= 2 || line.includes(':')) // A title part has >= 2 words or a colon
        .join(' ') // Join the parts with a space
        .trim();

    if (courseTitle) {
        data.courseName = courseTitle;
    }

    // --- Other Fields ---
    data.organization = 'Udemy';
    const dateRegex = /Date\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i;
    if (dateRegex.test(text)) {
        data.issuedDate = new Date(text.match(dateRegex)[1]);
    }

    // A parse is only valid if we found both a name and a course name.
    return (data.name && data.courseName) ? data : null;
}


// The main processing function (This logic is stable and correct)
function processCertificate(text, students) {
    // Find the known student first. This is the core of your idea.
    const student = findKnownStudent(text, students);

    if (!student) {
        return null; // If no student name from the DB is found in the text, fail.
    }

    let parsedDetails = {};
    if (text.match(/NPTEL|Indian Institute of Technology/i)) {
        parsedDetails = parseNPTEL(text);
    } 
    else if (text.match(/udemy|CERTIFICATE OF COMPLETION/i)) {
        parsedDetails = parseUdemy(text);
    }
    
    return {
        student: student,
        ...parsedDetails
    };
}


// The student name matching function (This logic is stable and correct)
function findKnownStudent(text, students) {
    const upperCaseText = text.toUpperCase();
    for (const student of students) {
        const nameParts = student.displayName.toUpperCase().split(' ');
        const allPartsFound = nameParts.every(part => upperCaseText.includes(part));
        if (allPartsFound) {
            console.log(`Found a match for student: ${student.displayName}`);
            return student;
        }
    }
    console.log("No known student name was found in the certificate text.");
    return null;
}


module.exports = { processCertificate };