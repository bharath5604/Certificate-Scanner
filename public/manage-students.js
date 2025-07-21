document.addEventListener('DOMContentLoaded', () => {
    const studentListContainer = document.getElementById('student-list-container');
    const listSpinner = document.getElementById('list-spinner');
    
    // Modal elements
    const modal = document.getElementById('edit-modal');
    const closeModalButton = document.querySelector('.close-button');
    const editForm = document.getElementById('editStudentForm');
    const studentIdInput = document.getElementById('editStudentId');
    const studentNameInput = document.getElementById('editStudentName');
    const rollNoInput = document.getElementById('editRollNo'); // <-- Get the new roll number input
    const saveButton = document.getElementById('save-edit-button');
    const editStatusMessage = document.getElementById('edit-status-message');

    // Function to fetch and display all students
    async function fetchStudents() {
        try {
            const response = await fetch('/students');
            if (!response.ok) throw new Error('Failed to fetch students.');
            
            const students = await response.json();
            
            listSpinner.style.display = 'none';
            studentListContainer.innerHTML = ''; // Clear previous content

            if (students.length === 0) {
                studentListContainer.innerHTML = '<p class="empty-list-message">No students found. Please add a student first.</p>';
                return;
            }

            students.forEach(student => {
                const studentDiv = document.createElement('div');
                studentDiv.className = 'student-item';
                // --- MODIFIED: Display rollNo and add it to the button's data attributes ---
                studentDiv.innerHTML = `
                    <span class="student-name">${student.displayName}</span>
                    <span class="student-rollno">${student.rollNo}</span>
                    <button class="edit-btn" data-id="${student._id}" data-name="${student.displayName}" data-rollno="${student.rollNo}">Edit</button>
                `;
                studentListContainer.appendChild(studentDiv);
            });

        } catch (error) {
            listSpinner.style.display = 'none';
            studentListContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    // --- Modal Logic ---
    // --- MODIFIED: Accept rollNo and set its value in the modal ---
    function openModal(id, name, rollNo) {
        studentIdInput.value = id;
        studentNameInput.value = name;
        rollNoInput.value = rollNo; // Set the roll number input
        editStatusMessage.textContent = '';
        editStatusMessage.className = '';
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Event delegation for edit buttons
    // --- MODIFIED: Get rollNo from the button and pass it to openModal ---
    studentListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            const rollNo = e.target.dataset.rollno; // Get the roll number
            openModal(id, name, rollNo); // Pass it to the function
        }
    });

    // Handle form submission for editing
    // --- MODIFIED: Get rollNo value and include it in the PUT request body ---
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = studentIdInput.value;
        const newName = studentNameInput.value.trim();
        const newRollNo = rollNoInput.value.trim(); // Get the new roll number

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        editStatusMessage.textContent = '';
        
        try {
            const response = await fetch(`/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Send both fields in the request body
                body: JSON.stringify({ displayName: newName, rollNo: newRollNo })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            editStatusMessage.textContent = result.message;
            editStatusMessage.className = 'success';
            
            // Refresh the student list after a short delay
            setTimeout(() => {
                closeModal();
                fetchStudents();
            }, 1500);

        } catch (error) {
            editStatusMessage.textContent = error.message;
            editStatusMessage.className = 'error';
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });

    // Initial fetch of students when the page loads
    fetchStudents();
});