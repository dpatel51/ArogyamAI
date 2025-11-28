// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Staffing API
export const staffingAPI = {
    getAll: (hospitalId, params = {}) =>
        fetch(`${API_BASE_URL}/resources/staffing?hospital_id=${hospitalId}&${new URLSearchParams(params)}`).then(r => r.json()),

    create: (data) =>
        fetch(`${API_BASE_URL}/resources/staffing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json())
};

// Inventory API
export const inventoryAPI = {
    getAll: (hospitalId, params = {}) =>
        fetch(`${API_BASE_URL}/resources/inventory?hospital_id=${hospitalId}&${new URLSearchParams(params)}`).then(r => r.json()),

    create: (data) =>
        fetch(`${API_BASE_URL}/resources/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json())
};

// Bed Capacity API
export const bedCapacityAPI = {
    getAll: (hospitalId, params = {}) =>
        fetch(`${API_BASE_URL}/resources/capacity?hospital_id=${hospitalId}&${new URLSearchParams(params)}`).then(r => r.json()),

    create: (data) =>
        fetch(`${API_BASE_URL}/resources/capacity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json())
};

// Purchase Orders API
export const ordersAPI = {
    getAll: (hospitalId, params = {}) =>
        fetch(`${API_BASE_URL}/procurement/orders?hospital_id=${hospitalId}&${new URLSearchParams(params)}`).then(r => r.json()),

    getOne: (orderId) =>
        fetch(`${API_BASE_URL}/procurement/orders/${orderId}`).then(r => r.json()),

    create: (data) =>
        fetch(`${API_BASE_URL}/procurement/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    updateStatus: (orderId, status) =>
        fetch(`${API_BASE_URL}/procurement/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        }).then(r => r.json())
};

// Suppliers API
export const suppliersAPI = {
    getAll: (params = {}) =>
        fetch(`${API_BASE_URL}/procurement/suppliers?${new URLSearchParams(params)}`).then(r => r.json()),

    create: (data) =>
        fetch(`${API_BASE_URL}/procurement/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json())
};
