document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', login);
    }

    if (document.getElementById('customerForm')) {
        document.getElementById('customerForm').addEventListener('submit', saveCustomer);
    }

    if (document.getElementById('customerTable')) {
        loadCustomers();
    }
});

async function login(event) {
    event.preventDefault();
    const loginId = document.getElementById('loginId').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginId, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = 'customer_list.html';
    } else {
        alert('Login failed!');
    }
}

async function loadCustomers() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('/api/customers', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const customers = await response.json();
    const tbody = document.querySelector('#customerTable tbody');
    tbody.innerHTML = '';

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.firstName}</td>
            <td>${customer.lastName}</td>
            <td>${customer.street}</td>
            <td>${customer.address}</td>
            <td>${customer.city}</td>
            <td>${customer.state}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>
                <button onclick="editCustomer(${customer.id})">Edit</button>
                <button onclick="deleteCustomer(${customer.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function saveCustomer(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const customer = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        street: document.getElementById('street').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(customer)
    });

    if (response.ok) {
        window.location.href = 'customer_list.html';
    } else {
        alert('Failed to save customer!');
    }
}

async function deleteCustomer(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        loadCustomers();
    } else {
        alert('Failed to delete customer!');
    }
}

async function syncCustomers() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('https://qa.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const remoteCustomers = await response.json();
        for (const customer of remoteCustomers) {
            await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(customer)
            });
        }
        loadCustomers();
    } else {
        alert('Failed to sync customers!');
    }
}
