import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import './OrdersTab.css';

function OrdersTab({ hospitalId }) {
    const [ orders, setOrders ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ filter, setFilter ] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [ hospitalId, filter ]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await ordersAPI.getAll(hospitalId, params);
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId) => {
        try {
            await ordersAPI.updateStatus(orderId, 'approved');
            fetchOrders();
        } catch (error) {
            console.error('Error approving order:', error);
        }
    };

    const handleReject = async (orderId) => {
        try {
            await ordersAPI.updateStatus(orderId, 'rejected');
            fetchOrders();
        } catch (error) {
            console.error('Error rejecting order:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'warning', icon: '⏳', label: 'Pending' },
            approved: { class: 'success', icon: '✅', label: 'Approved' },
            ordered: { class: 'info', icon: '📦', label: 'Ordered' },
            delivered: { class: 'success', icon: '✓', label: 'Delivered' },
            rejected: { class: 'critical', icon: '❌', label: 'Rejected' }
        };
        const config = statusMap[ status ] || statusMap.pending;
        return (
            <span className={`status-badge status-${config.class}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            urgent: { class: 'critical', icon: '🔴' },
            normal: { class: 'info', icon: '🟡' },
            low: { class: 'success', icon: '🟢' }
        };
        const config = priorityMap[ priority ] || priorityMap.normal;
        return (
            <span className={`priority-badge priority-${config.class}`}>
                {config.icon} {priority.toUpperCase()}
            </span>
        );
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        approved: orders.filter(o => o.status === 'approved').length
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="orders-tab">
            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                </div>
                <div className="stat-card critical">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending Approval</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.approved}</div>
                        <div className="stat-label">Approved</div>
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
                        All Orders
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📋 Purchase Orders</h3>
                    <button className="btn btn-primary">+ Create Order</button>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">No orders found</div>
                        <p>Create purchase orders to start procurement</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order, idx) => (
                            <div key={idx} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <h4 className="order-id">{order.order_id}</h4>
                                        <p className="order-supplier">{order.supplier_name}</p>
                                    </div>
                                    <div className="order-badges">
                                        {getPriorityBadge(order.priority)}
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                <div className="order-details">
                                    <div className="order-detail-item">
                                        <span className="detail-label">Items:</span>
                                        <span className="detail-value">{order.items_count} items</span>
                                    </div>
                                    <div className="order-detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">₹{order.total_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="order-detail-item">
                                        <span className="detail-label">Requested:</span>
                                        <span className="detail-value">
                                            {new Date(order.requested_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {order.status === 'pending' && (
                                    <div className="order-actions">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(order.order_id)}
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(order.order_id)}
                                        >
                                            ❌ Reject
                                        </button>
                                        <button className="btn btn-secondary">
                                            👁️ View Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrdersTab;
