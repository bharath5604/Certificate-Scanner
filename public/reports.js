document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filterForm');
    const rollNoInput = document.getElementById('rollNoFilter');
    const reportSection = document.getElementById('report-section');
    const reportStudentName = document.getElementById('report-student-name');
    const certificateListDiv = document.getElementById('certificate-report-list');
    const statusMessage = document.getElementById('report-status-message');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    // V-- ADD THIS LINE --V
    const downloadXlsxBtn = document.getElementById('downloadXlsxBtn');
    let currentStudentData = null; // To store data for PDF/Excel generation

    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rollNo = rollNoInput.value.trim();
        if (!rollNo) {
            alert('Please enter a roll number.');
            return;
        }

        reportSection.style.display = 'none';
        statusMessage.textContent = 'Searching...';
        statusMessage.className = '';

        try {
            const response = await fetch(`/students/certificates/${rollNo}`);
            const result = await response.json();

            if (!response.ok) throw new Error(result.message);
            
            currentStudentData = result; // Save the data
            displayReport(result);

        } catch (error) {
            statusMessage.textContent = error.message;
            statusMessage.className = 'error';
            currentStudentData = null;
        }
    });

    function displayReport(data) {
        statusMessage.textContent = '';
        reportStudentName.textContent = `Report for: ${data.student.displayName}`;
        
        certificateListDiv.innerHTML = '';
        if (data.certificates.length === 0) {
            certificateListDiv.innerHTML = '<p class="empty-list-message">No certificates found for this student.</p>';
        } else {
            data.certificates.forEach(cert => {
                const certDiv = document.createElement('div');
                certDiv.className = 'report-item';
                certDiv.innerHTML = `
                    <span class="course-name">${cert.courseName || 'N/A'}</span>
                    <span class="organization">${cert.organization || 'N/A'}</span>
                `;
                certificateListDiv.appendChild(certDiv);
            });
        }
        reportSection.style.display = 'block';
    }

    // PDF Generation Logic (Existing)
    // downloadPdfBtn.addEventListener('click', () => {
    //     if (!currentStudentData) {
    //         alert('No data to download.');
    //         return;
    //     }

    //     const { jsPDF } = window.jspdf;
    //     const doc = new jsPDF();

    //     const student = currentStudentData.student;
    //     const certificates = currentStudentData.certificates;

    //     // Add Header
    //     doc.setFontSize(22);
    //     doc.text('Student Certificate Report', 14, 22);
    //     doc.setFontSize(12);
    //     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
    //     // Add Student Info
    //     doc.setFontSize(16);
    //     doc.text(`Student: ${student.displayName}`, 14, 45);
    //     doc.setFontSize(12);
    //     doc.text(`Roll No: ${student.rollNo}`, 14, 52);

    //     // Prepare table data
    //     const tableColumn = ["Roll Number", "Student Name", "Course Name"];
    //     const tableRows = [];

    //     certificates.forEach(cert => {
    //         const certData = [
    //             student.rollNo,
    //             student.displayName,
    //             cert.courseName || 'N/A'
    //         ];
    //         tableRows.push(certData);
    //     });

    //     // Add table to PDF
    //     doc.autoTable({
    //         head: [tableColumn],
    //         body: tableRows,
    //         startY: 60,
    //         theme: 'striped',
    //         headStyles: { fillColor: [15, 52, 96] }
    //     });
        
    //     // Save the PDF
    //     doc.save(`report_${student.rollNo}.pdf`);
    // });

    // --- VVV NEW FEATURE: EXCEL DOWNLOAD LOGIC VVV ---
    downloadXlsxBtn.addEventListener('click', () => {
        if (!currentStudentData) {
            alert('No data to download.');
            return;
        }

        const { student, certificates } = currentStudentData;

        // 1. Define the headers for the Excel file
        const headers = [
            "Roll Number", 
            "Student Name", 
            "Course Name", 
            "Organization",
            // "Credential ID",
            // "Issue Date" // Using 'createdAt' as a proxy for issue date
        ];

        // 2. Map the certificate data to rows, starting with the header row
        const dataForSheet = [
            headers,
            ...certificates.map(cert => [
                student.rollNo,
                student.displayName,
                cert.courseName || 'N/A',
                cert.organization || 'N/A',
                // cert.credentialID || 'N/A',
                // new Date(cert.createdAt).toLocaleDateString() // Format date nicely
            ])
        ];

        // 3. Create a new workbook and a worksheet from the data array
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(dataForSheet);

        // 4. Append the worksheet to the workbook with a custom sheet name
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Certificates');

        // 5. Trigger the download of the Excel file
        XLSX.writeFile(workbook, `report_${student.rollNo}.xlsx`);
    });
});