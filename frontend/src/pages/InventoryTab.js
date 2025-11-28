import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import './InventoryTab.css';

function InventoryTab({ hospitalId }) {
    const [ inventory, setInventory ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ filter, setFilter ] = useState('all');

    useEffect(() => {
        fetchInventory();
    }, [ hospitalId, filter ]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = filter === 'low' ? { low_stock: 'true' } : {};
            const response = await inventoryAPI.getAll(hospitalId, params);
            if (response.success) {
                setInventory(response.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (item) => {
        if (item.current_stock < item.reorder_level) {
            return <span className="status-badge status-critical">🔴 Low Stock</span>;
        }
        return <span className="status-badge status-success">🟢 Good</span>;
    };

    const stats = {
        total: inventory.length,
        low: inventory.filter(i => i.current_stock < i.reorder_level).length,
        adequate: inventory.filter(i => i.current_stock >= i.reorder_level).length
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="inventory-tab">
            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Items</div>
                    </div>
                </div>
                <div className="stat-card critical">
                    <div className="stat-icon">🔴</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.low}</div>
                        <div className="stat-label">Low Stock</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">🟢</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.adequate}</div>
                        <div className="stat-label">Adequate Stock</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Items
                    </button>
                    <button
                        className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
                        onClick={() => setFilter('low')}
                    >
                        Low Stock Only
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📦 Inventory Items</h3>
                    <button className="btn btn-primary">+ Add Item</button>
                </div>

                {inventory.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <div className="empty-state-title">No inventory items found</div>
                        <p>Add items to start tracking your inventory</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Level</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, idx) => (
                                    <tr key={idx}>
                                        <td><strong>{item.item_name}</strong></td>
                                        <td>
                                            <span className="category-badge">{item.category}</span>
                                        </td>
                                        <td>
                                            <strong>{item.current_stock}</strong> {item.unit}
                                        </td>
                                        <td>{item.reorder_level} {item.unit}</td>
                                        <td>{item.location}</td>
                                        <td>{getStatusBadge(item)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InventoryTab;
