# CertiScan: AI-Powered Certificate Management System

CertiScan is a full-stack web application designed to automate the process of extracting, verifying, and managing data from educational certificates. Using AI-powered Optical Character Recognition (OCR), it intelligently parses certificate images (like those from NPTEL and Udemy), links them to a student database, and stores the information in a structured and searchable format.

## Key Features

-   **AI-Powered OCR**: Utilizes Tesseract.js for robust, server-side text extraction from certificate images. The architecture is modular, allowing for integration with other services like Google Cloud Vision.
-   **Student Database**: Maintain a centralized database of students. Certificates can only be processed for known, registered students.
-   **Intelligent Parsing**: Custom parsers for different certificate formats (e.g., NPTEL, Udemy) accurately identify key information like Course Name and Credential ID.
-   **Duplicate Prevention**: Prevents the same certificate from being uploaded for a student more than once by checking against the Credential ID or Course Name.
-   **Full CRUD for Students**: A user-friendly interface to **C**reate, **R**ead, **U**pdate, and manage student records (Name and Roll Number).
-   **Comprehensive Reporting**:
    -   Filter and view all certificates for a specific student by their roll number.
    -   Download per-student reports in **Excel (`.xlsx`)** format.
    -   Export a complete report of **all certificates for all students** in a single Excel file.
-   **Modern Frontend**: A clean, responsive, and user-friendly interface built with vanilla JavaScript, HTML5, and CSS3, featuring drag-and-drop file uploads and real-time feedback.
-   **RESTful API**: A well-defined backend API to handle file uploads, data processing, and database interactions.

## How It Works

1.  **Add Students**: An administrator first adds students to the database, including their full name and unique roll number.
2.  **Upload Certificate**: A user uploads a certificate image (JPG, PNG) via the web interface.
3.  **OCR Processing**: The server preprocesses the image (greyscale, contrast adjustment) and uses Tesseract.js to extract all visible text.
4.  **Student Identification**: The system scans the OCR text to find a name matching a known student from the database. This is the crucial first step for validation.
5.  **Data Parsing**: If a student is found, the system detects the certificate type (e.g., NPTEL) and applies the corresponding parser to extract structured data (Course Name, Credential ID, etc.).
6.  **Duplicate Check**: The system checks if a certificate with the same Credential ID or Course Name already exists for that specific student.
7.  **Save to Database**: If the certificate is unique, the data is saved to the MongoDB database and linked to the identified student's record.
8.  **Feedback**: The user receives a success or error message with the outcome.

## Tech Stack

| Category        | Technology / Library                                                                |
| :-------------- | :---------------------------------------------------------------------------------- |
| **Backend**     | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)                    |
| **Database**    | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM      |
| **OCR**         | [Tesseract.js](https://tesseract.projectnaptha.com/)                                |
| **File Upload** | [Multer](https://github.com/expressjs/multer)                                       |
| **Image Proc.** | [Jimp](https://github.com/jimp-dev/jimp)                                            |
| **Frontend**    | HTML5, CSS3, Vanilla JavaScript                                                     |
| **Exporting**   | [XLSX (SheetJS)](https://sheetjs.com/) for generating `.xlsx` files                  |

## Project Structure
Use code with caution.
Markdown
certiscan/
├── models/
│ ├── certificateModel.js # Mongoose schema for certificates
│ └── studentModel.js # Mongoose schema for students
├── node_modules/ # (Ignored by Git) Project dependencies
├── public/ # Static files served to the client
│ ├── add-student.html # Page to add new students
│ ├── export.html # Page to export all data
│ ├── index.html # Main upload page
│ ├── manage-students.html # Page to view and edit students
│ ├── reports.html # Page to generate reports
│ ├── export.js
│ ├── manage-students.js
│ ├── reports.js
│ ├── script.js
│ └── style.css
├── services/
│ ├── ocr.js # (Optional) Google Vision AI integration
│ ├── parser.js # Logic for parsing text from different certificate types
│ └── utils.js # Utility functions (e.g., name normalization)
├── uploads/ # (Ignored by Git) Directory for uploaded certificate images
├── .gitignore # Specifies files for Git to ignore
├── package.json
├── package-lock.json
├── README.md # This file
└── server.js # Main Express server file
Generated code
## Setup and Installation

### Prerequisites

-   [Node.js](https://nodejs.org/en/download/) (v14 or higher)
-   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### Installation Steps

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd certiscan
    ```

2.  **Install backend dependencies:**
    ```sh
    npm install
    ```
    This will install Express, Mongoose, Tesseract.js, Multer, etc.

3.  **Configure the database:**
    -   Open the `server.js` file.
    -   Locate the `mongoose.connect` line and ensure the connection string points to your local MongoDB instance. The default is usually correct:
        ```javascript
        mongoose.connect('mongodb://127.0.0.1:27017/certiscanDB', { ... });
        ```

4.  **Run the application:**
    ```sh
    node server.js
    ```

5.  **Access CertiScan:**
    -   Open your web browser and navigate to `http://localhost:3000`.

You should now see the main certificate upload page.
