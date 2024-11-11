document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const dashboardPage = document.getElementById('dashboardPage');
  const loginPage = document.getElementById('loginPage');
  // Handle Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === 'admin') {
      loginPage.classList.add('d-none');  
      dashboardPage.classList.remove('d-none');
      navigate('viewPatients');
    } else {
      alert('Invalid login');
    }   
  });

  // Navigation
  window.navigate = (section) => {
    document.querySelectorAll('main > div').forEach(el => el.classList.add('d-none'));
    document.getElementById(section).classList.remove('d-none');
    
    document.querySelectorAll('.sidebar .nav-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`.sidebar .nav-link[onclick="navigate('${section}')"]`).classList.add('active');

    switch(section) {
      case 'viewPatients':
        fetchAndPopulateTable('/patients', 'patientsTableBody');
        break;
      case 'viewDoctors':
        fetchAndPopulateTable('/doctors', 'doctorsTableBody');
        break;
      case 'viewRooms':
        fetchAndPopulateTable('/rooms', 'roomsTableBody');
        break;
      case 'viewMedicines':
        fetchAndPopulateTable('/medicines', 'medicinesTableBody');
        break;
    }
  };

  // Generic function to handle form submissions
  const handleFormSubmit = (formId, url, viewSection) => {
    const form = document.getElementById(formId);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);
        form.reset();
        navigate(viewSection);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  };

  // Initialize form submission handlers
  handleFormSubmit('addPatientForm', '/register/patient', 'viewPatients');
  handleFormSubmit('addDoctorForm', '/register/doctor', 'viewDoctors');
  handleFormSubmit('addRoomForm', '/add/room', 'viewRooms');
  handleFormSubmit('addMedicineForm', '/add/medicine', 'viewMedicines');

  // Generic function to fetch and populate tables
  async function fetchAndPopulateTable(url, tableBodyId) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const tableBody = document.getElementById(tableBodyId);
      tableBody.innerHTML = '';

      data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = Object.values(item).map(value => `<td>${value}</td>`).join('');
        row.innerHTML += `
          <td>
            <button class="btn btn-sm btn-primary" onclick="editItem('${url}', ${item.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteItem('${url}', ${item.id})">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      alert(`Failed to fetch data: ${error.message}`);
    }
  }

  // Edit and Delete functions
  window.editItem = (url, id) => {
    alert(`Edit item with ID: ${id} from ${url}`);
    // Implement edit functionality
  };

  window.deleteItem = async (url, id) => {
    if (confirm(`Are you sure you want to delete this item with ID: ${id}?`)) {
      try {
        const response = await fetch(`${url}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert(`Item with ID: ${id} deleted`);
        navigate(url.slice(1)); // Remove leading slash and navigate to view
      } catch (error) {
        alert(`Failed to delete item: ${error.message}`);
      }
    }
  };

  // Initialize event listeners for navigation
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = e.target.getAttribute('onclick').match(/'(.+)'/)[1];
      navigate(section);
    });
  });
});   