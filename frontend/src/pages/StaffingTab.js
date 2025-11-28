import React, { useState, useEffect } from 'react';
import { staffingAPI } from '../services/api';
import './StaffingTab.css';

function StaffingTab({ hospitalId }) {
    const [ staffing, setStaffing ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        fetchStaffing();
    }, [ hospitalId ]);

    const fetchStaffing = async () => {
        try {
            setLoading(true);
            const response = await staffingAPI.getAll(hospitalId);
            if (response.success) {
                setStaffing(response.data);
            }
        } catch (error) {
            console.error('Error fetching staffing:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalByType = (type) => {
        return staffing
            .filter(s => s.staff_type === type)
            .reduce((sum, s) => sum + s.current_count, 0);
    };

    const getAvailableByType = (type) => {
        return staffing
            .filter(s => s.staff_type === type)
            .reduce((sum, s) => sum + s.available_count, 0);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="staffing-tab">
            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👨‍⚕️</div>
                    <div className="stat-content">
                        <div className="stat-value">{getTotalByType('doctor')}</div>
                        <div className="stat-label">Doctors</div>
                        <div className="stat-sub">{getAvailableByType('doctor')} available</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👩‍⚕️</div>
                    <div className="stat-content">
                        <div className="stat-value">{getTotalByType('nurse')}</div>
                        <div className="stat-label">Nurses</div>
                        <div className="stat-sub">{getAvailableByType('nurse')} available</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👷</div>
                    <div className="stat-content">
                        <div className="stat-value">{getTotalByType('support_staff')}</div>
                        <div className="stat-label">Support Staff</div>
                        <div className="stat-sub">{getAvailableByType('support_staff')} available</div>
                    </div>
                </div>
            </div>

            {/* Staffing Details */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">👥 Staffing by Department & Shift</h3>
                    <button className="btn btn-primary">+ Add Staff</button>
                </div>

                {staffing.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <div className="empty-state-title">No staffing data found</div>
                        <p>Add staff records to start tracking</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Staff Type</th>
                                    <th>Shift</th>
                                    <th>Total</th>
                                    <th>On Shift</th>
                                    <th>Available</th>
                                    <th>On Leave</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffing.map((staff, idx) => (
                                    <tr key={idx}>
                                        <td><strong>{staff.department}</strong></td>
                                        <td>
                                            <span className="staff-type-badge">{staff.staff_type.replace('_', ' ')}</span>
                                        </td>
                                        <td>
                                            <span className={`shift-badge shift-${staff.shift}`}>
                                                {staff.shift}
                                            </span>
                                        </td>
                                        <td><strong>{staff.current_count}</strong></td>
                                        <td>{staff.on_shift_count}</td>
                                        <td>
                                            <span className="status-badge status-success">
                                                {staff.available_count}
                                            </span>
                                        </td>
                                        <td>{staff.on_leave_count}</td>
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

export default StaffingTab;
