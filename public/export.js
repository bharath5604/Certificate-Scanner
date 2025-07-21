document.addEventListener('DOMContentLoaded', () => {
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const statusMessage = document.getElementById('export-status-message');

    downloadAllBtn.addEventListener('click', async () => {
        statusMessage.textContent = 'Generating report... Please wait.';
        statusMessage.className = '';
        downloadAllBtn.disabled = true;
        downloadAllBtn.textContent = 'Generating...';

        try {
            // Fetch all certificates from the new endpoint
            const response = await fetch('/certificates/all');
            const allCertificates = await response.json();

            if (!response.ok) {
                throw new Error(allCertificates.message || 'Failed to fetch data.');
            }

            if (allCertificates.length === 0) {
                alert('No certificates found in the database to export.');
                return;
            }

            // 1. Prepare the data for the worksheet
            const worksheetData = [
                ["Roll Number", "Student Name", "Course Name", "Organization", "Certificate ID"]
            ];

            // Add a row for each certificate
            allCertificates.forEach(cert => {
                // The 'student' field is populated with the student's details
                const student = cert.student; 
                const certData = [
                    student ? student.rollNo : 'N/A',
                    student ? student.displayName : 'N/A',
                    cert.courseName || 'N/A',
                    cert.organization || 'N/A',
                    cert._id // The certificate's own ID
                ];
                worksheetData.push(certData);
            });

            // 2. Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            // Optional: Set column widths
            ws['!cols'] = [
                { wch: 20 }, { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 25 }
            ];

            // 3. Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'All Certificates');

            // 4. Trigger download
            XLSX.writeFile(wb, `CertiScan_Complete_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

            statusMessage.textContent = 'Report generated successfully!';
            statusMessage.classList.add('success');

        } catch (error) {
            console.error('Export failed:', error);
            statusMessage.textContent = `Error: ${error.message}`;
            statusMessage.classList.add('error');
        } finally {
            downloadAllBtn.disabled = false;
            downloadAllBtn.textContent = 'Download All Data as Excel';
        }
    });
});