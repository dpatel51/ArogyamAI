import React, { useState, useEffect } from 'react';
import { bedCapacityAPI } from '../services/api';
import './BedCapacityTab.css';

function BedCapacityTab({ hospitalId }) {
    const [ capacity, setCapacity ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        fetchCapacity();
    }, [ hospitalId ]);

    const fetchCapacity = async () => {
        try {
            setLoading(true);
            const response = await bedCapacityAPI.getAll(hospitalId);
            if (response.success) {
                setCapacity(response.data);
            }
        } catch (error) {
            console.error('Error fetching capacity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalBeds = () => capacity.reduce((sum, c) => sum + c.total_beds, 0);
    const getOccupiedBeds = () => capacity.reduce((sum, c) => sum + c.occupied_beds, 0);
    const getAvailableBeds = () => capacity.reduce((sum, c) => sum + c.available_beds, 0);

    const getOccupancyColor = (rate) => {
        if (rate >= 85) return 'critical';
        if (rate >= 70) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="bed-capacity-tab">
            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🛏️</div>
                    <div className="stat-content">
                        <div className="stat-value">{getTotalBeds()}</div>
                        <div className="stat-label">Total Beds</div>
                    </div>
                </div>
                <div className="stat-card critical">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{getOccupiedBeds()}</div>
                        <div className="stat-label">Occupied</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{getAvailableBeds()}</div>
                        <div className="stat-label">Available</div>
                    </div>
                </div>
            </div>

            {/* Capacity by Ward */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🛏️ Bed Capacity by Ward Type</h3>
                    <button className="btn btn-primary">+ Update Capacity</button>
                </div>

                {capacity.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛏️</div>
                        <div className="empty-state-title">No bed capacity data found</div>
                        <p>Add capacity records to start tracking</p>
                    </div>
                ) : (
                    <div className="capacity-grid">
                        {capacity.map((ward, idx) => {
                            const occupancyRate = Math.round((ward.occupied_beds / ward.total_beds) * 100);
                            const statusClass = getOccupancyColor(occupancyRate);

                            return (
                                <div key={idx} className={`capacity-card ${statusClass}`}>
                                    <div className="capacity-header">
                                        <h4 className="capacity-ward">{ward.ward_type.toUpperCase()}</h4>
                                        <span className={`status-badge status-${statusClass}`}>
                                            {occupancyRate}%
                                        </span>
                                    </div>

                                    <div className="capacity-stats">
                                        <div className="capacity-stat">
                                            <span className="capacity-stat-label">Total Beds</span>
                                            <span className="capacity-stat-value">{ward.total_beds}</span>
                                        </div>
                                        <div className="capacity-stat">
                                            <span className="capacity-stat-label">Occupied</span>
                                            <span className="capacity-stat-value">{ward.occupied_beds}</span>
                                        </div>
                                        <div className="capacity-stat">
                                            <span className="capacity-stat-label">Available</span>
                                            <span className="capacity-stat-value available">{ward.available_beds}</span>
                                        </div>
                                        <div className="capacity-stat">
                                            <span className="capacity-stat-label">Reserved</span>
                                            <span className="capacity-stat-value">{ward.reserved_beds}</span>
                                        </div>
                                    </div>

                                    <div className="capacity-bar">
                                        <div
                                            className="capacity-bar-fill"
                                            style={{ width: `${occupancyRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BedCapacityTab;
