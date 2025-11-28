import React, { useState } from 'react';
import './SurgePredictionDashboard.css';

function SurgePredictionDashboard({ hospitalId }) {
    const [surgeData] = useState({
        aqi: 285,
        aqi_status: 'Very Unhealthy',
        aqi_trend: 'up',
        surge_risk: 65,
        surge_severity: 'HIGH',
        predicted_patients_7d: 320,
        predicted_patients_14d: 450
    });

    const [riskFactors] = useState([
        {
            id: 1,
            name: 'Air Quality (AQI)',
            value: 285,
            status: 'critical',
            icon: '💨',
            unit: 'AQI',
            threshold: 300,
            description: 'Very Unhealthy - Respiratory issues expected'
        },
        {
            id: 2,
            name: 'Upcoming Events',
            value: 'Diwali (3 days)',
            status: 'warning',
            icon: '🎉',
            description: 'Large gathering expected'
        },
        {
            id: 3,
            name: 'Disease Outbreak',
            value: 'Mild',
            status: 'warning',
            icon: '🦠',
            description: 'Flu-like symptoms reported'
        },
        {
            id: 4,
            name: 'OTC Medicine Sales',
            value: '+45%',
            status: 'critical',
            icon: '💊',
            description: 'Spike in respiratory medicine sales'
        }
    ]);

    const [hospitalMetrics] = useState([
        {
            id: 1,
            name: 'Bed Occupancy',
            current: 185,
            total: 250,
            percentage: 74,
            status: 'warning',
            icon: '🛏️',
            unit: 'beds'
        },
        {
            id: 2,
            name: 'Ventilators',
            current: 32,
            total: 45,
            percentage: 71,
            status: 'warning',
            icon: '💨',
            unit: 'units'
        },
        {
            id: 3,
            name: 'ICU Available',
            current: 8,
            total: 30,
            percentage: 27,
            status: 'critical',
            icon: '🚨',
            unit: 'beds'
        },
        {
            id: 4,
            name: 'Medical Staff',
            current: 156,
            total: 180,
            percentage: 87,
            status: 'critical',
            icon: '👨‍⚕️',
            unit: 'staff'
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            case 'success':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'critical':
                return 'status-critical';
            case 'warning':
                return 'status-warning';
            case 'success':
                return 'status-success';
            default:
                return 'status-info';
        }
    };

    const getSurgeColor = () => {
        if (surgeData.surge_risk >= 70) return '#ef4444';
        if (surgeData.surge_risk >= 50) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div className="surge-dashboard">
            {/* Main Surge Alert Card */}
            <div className="surge-alert-card" style={{ borderTop: `6px solid ${getSurgeColor()}` }}>
                <div className="surge-alert-header">
                    <div className="surge-alert-title">
                        <span className="surge-icon">🚨</span>
                        <div>
                            <h2>Surge Prediction Alert</h2>
                            <p className="surge-subtitle">Hospital Resource Management System</p>
                        </div>
                    </div>
                    <div className="surge-risk-indicator">
                        <div className="risk-circle" style={{ background: getSurgeColor() }}>
                            <span className="risk-percentage">{surgeData.surge_risk}%</span>
                        </div>
                        <div className="risk-label">Surge Risk</div>
                    </div>
                </div>

                <div className="surge-alert-content">
                    <div className="surge-message">
                        <p className={`severity-${surgeData.surge_severity.toLowerCase()}`}>
                            ⚠️ <strong>{surgeData.surge_severity} Risk Detected</strong>
                        </p>
                        <p className="alert-description">
                            AQI crossed {surgeData.aqi} + Diwali in 3 days → Expected <strong>{surgeData.predicted_patients_7d}+ patients</strong> in 7 days
                        </p>
                    </div>

                    <div className="surge-predictions">
                        <div className="prediction-item">
                            <span className="prediction-label">Next 7 Days</span>
                            <span className="prediction-value">{surgeData.predicted_patients_7d}+</span>
                            <span className="prediction-unit">patients</span>
                        </div>
                        <div className="prediction-divider"></div>
                        <div className="prediction-item">
                            <span className="prediction-label">Next 14 Days</span>
                            <span className="prediction-value">{surgeData.predicted_patients_14d}+</span>
                            <span className="prediction-unit">patients</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AQI Card */}
            <div className="aqi-card">
                <div className="aqi-header">
                    <div className="aqi-title">
                        <span className="aqi-icon">💨</span>
                        <div>
                            <h3>Air Quality Index</h3>
                            <p className="aqi-subtitle">Real-time environmental data</p>
                        </div>
                    </div>
                </div>

                <div className="aqi-content">
                    <div className="aqi-main-display">
                        <div className="aqi-value-circle" style={{ borderColor: getSurgeColor() }}>
                            <div className="aqi-number">{surgeData.aqi}</div>
                            <div className="aqi-label">AQI</div>
                        </div>
                    </div>

                    <div className="aqi-details">
                        <div className="aqi-detail-item">
                            <span className="detail-label">Status</span>
                            <span className={`detail-value status-${surgeData.aqi_status.toLowerCase().replace(' ', '-')}`}>
                                {surgeData.aqi_status}
                            </span>
                        </div>
                        <div className="aqi-detail-item">
                            <span className="detail-label">Trend</span>
                            <span className={`detail-value trend-${surgeData.aqi_trend}`}>
                                {surgeData.aqi_trend === 'up' ? '📈 Rising' : '📉 Falling'}
                            </span>
                        </div>
                        <div className="aqi-detail-item">
                            <span className="detail-label">Impact</span>
                            <span className="detail-value impact-critical">Respiratory Risk</span>
                        </div>
                    </div>

                    <div className="aqi-scale">
                        <div className="scale-item good">0-50</div>
                        <div className="scale-item moderate">51-100</div>
                        <div className="scale-item unhealthy-sensitive">101-150</div>
                        <div className="scale-item unhealthy">151-200</div>
                        <div className="scale-item very-unhealthy">201-300</div>
                        <div className="scale-item hazardous">301+</div>
                    </div>
                </div>
            </div>

            {/* Risk Factors Grid */}
            <div className="section-title">
                <h3>🎯 Risk Factors</h3>
                <p>Contributing factors to surge prediction</p>
            </div>

            <div className="risk-factors-grid">
                {riskFactors.map((factor) => (
                    <div key={factor.id} className={`risk-factor-card ${getStatusBadgeClass(factor.status)}`}>
                        <div className="risk-factor-header">
                            <span className="risk-factor-icon">{factor.icon}</span>
                            <div className="risk-factor-title">
                                <h4>{factor.name}</h4>
                            </div>
                        </div>

                        <div className="risk-factor-content">
                            <div className="risk-factor-value">{factor.value}</div>
                            {factor.unit && <div className="risk-factor-unit">{factor.unit}</div>}
                            <p className="risk-factor-description">{factor.description}</p>
                        </div>

                        <div className={`risk-factor-badge ${getStatusBadgeClass(factor.status)}`}>
                            {factor.status === 'critical' && '🔴 Critical'}
                            {factor.status === 'warning' && '🟡 Warning'}
                            {factor.status === 'success' && '🟢 Good'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Hospital Metrics Grid */}
            <div className="section-title">
                <h3>🏥 Hospital Metrics</h3>
                <p>Current resource availability and capacity</p>
            </div>

            <div className="hospital-metrics-grid">
                {hospitalMetrics.map((metric) => (
                    <div key={metric.id} className={`metric-card ${getStatusBadgeClass(metric.status)}`}>
                        <div className="metric-header">
                            <div className="metric-title">
                                <span className="metric-icon">{metric.icon}</span>
                                <h4>{metric.name}</h4>
                            </div>
                            <span className={`metric-badge ${getStatusBadgeClass(metric.status)}`}>
                                {metric.status === 'critical' && '🔴'}
                                {metric.status === 'warning' && '🟡'}
                                {metric.status === 'success' && '🟢'}
                            </span>
                        </div>

                        <div className="metric-value">
                            <div className="value-display">
                                <span className="current">{metric.current}</span>
                                <span className="divider">/</span>
                                <span className="total">{metric.total}</span>
                                <span className="unit">{metric.unit}</span>
                            </div>
                        </div>

                        <div className="metric-progress">
                            <div className="progress-bar-bg">
                                <div
                                    className={`progress-bar-fill ${getStatusBadgeClass(metric.status)}`}
                                    style={{
                                        width: `${metric.percentage}%`,
                                        backgroundColor: getStatusColor(metric.status)
                                    }}
                                ></div>
                            </div>
                            <div className="progress-label">
                                <span>{metric.percentage}%</span>
                                <span className="capacity-status">Occupied</span>
                            </div>
                        </div>

                        <div className="metric-footer">
                            {metric.percentage >= 85 && (
                                <p className="metric-warning">⚠️ High occupancy - Plan resource allocation</p>
                            )}
                            {metric.percentage >= 70 && metric.percentage < 85 && (
                                <p className="metric-caution">⚡ Monitor closely</p>
                            )}
                            {metric.percentage < 70 && (
                                <p className="metric-good">✓ Adequate capacity</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Panel */}
            <div className="action-panel">
                <div className="action-header">
                    <h3>📋 Recommended Actions</h3>
                </div>
                <div className="action-items">
                    <div className="action-item urgent">
                        <span className="action-icon">🚨</span>
                        <div className="action-content">
                            <h4>Activate Surge Protocol</h4>
                            <p>Initiate Level 2 emergency response with backup staffing</p>
                        </div>
                        <button className="action-btn btn-danger">Act Now</button>
                    </div>
                    <div className="action-item">
                        <span className="action-icon">📞</span>
                        <div className="action-content">
                            <h4>Contact Suppliers</h4>
                            <p>Request emergency delivery of respiratory equipment</p>
                        </div>
                        <button className="action-btn btn-primary">Contact</button>
                    </div>
                    <div className="action-item">
                        <span className="action-icon">👥</span>
                        <div className="action-content">
                            <h4>Alert Medical Staff</h4>
                            <p>Notify on-call staff and prepare ICU for surge</p>
                        </div>
                        <button className="action-btn btn-primary">Alert</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SurgePredictionDashboard;
