document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const certificateFile = document.getElementById('certificateFile');
    const fileNameSpan = document.getElementById('file-name');
    const submitButton = document.getElementById('submit-button');
    const uploadArea = document.querySelector('.upload-area');

    const spinner = document.getElementById('spinner');
    const statusMessage = document.getElementById('status-message');
    const resultsContainer = document.getElementById('results-container');
    const resultsData = document.getElementById('results-data');

    // Function to update the file name display
    const updateFileName = (file) => {
        if (file) {
            fileNameSpan.textContent = file.name;
            fileNameSpan.style.color = '#fff';
        } else {
            fileNameSpan.textContent = 'No file selected';
            fileNameSpan.style.color = 'var(--text-muted)';
        }
    };

    // Listen for file selection via click
    certificateFile.addEventListener('change', () => {
        updateFileName(certificateFile.files[0]);
    });

    // --- Drag and Drop Functionality ---
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            certificateFile.files = files; // Assign dropped file to the input
            updateFileName(files[0]);
        }
    });

    // --- Form Submission ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!certificateFile.files.length) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('certificate', certificateFile.files[0]);

        // Reset UI for new submission
        spinner.style.display = 'flex';
        submitButton.disabled = true;
        statusMessage.style.display = 'none';
        document.getElementById('results-section').style.display = 'none'; 
        statusMessage.className = '';

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            // Try to parse response as JSON, if it fails, handle as text
            const responseText = await response.text();
            let result;

            try {
                result = JSON.parse(responseText);
            } catch (jsonError) {
                // If parsing fails, it's likely a plain text error from the server
                throw new Error(responseText);
            }

            if (response.ok) {
                statusMessage.textContent = result.message || 'Success!';
                statusMessage.classList.add('success');
                resultsData.textContent = JSON.stringify(result.data, null, 2);
                // Change the container being shown
                document.getElementById('results-section').style.display = 'block';
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            statusMessage.textContent = error.message;
            statusMessage.classList.add('error');
        } finally {
            spinner.style.display = 'none';
            statusMessage.style.display = 'block';
            submitButton.disabled = false;
        }
    });
});