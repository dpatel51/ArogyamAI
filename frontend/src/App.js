import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import SurgePredictionDashboard from './pages/SurgePredictionDashboard';
import InventoryTab from './pages/InventoryTab';
import StaffingTab from './pages/StaffingTab';
import BedCapacityTab from './pages/BedCapacityTab';
import OrdersTab from './pages/OrdersTab';
import AIChat from './components/AIChat';

function App() {
    const [ activeTab, setActiveTab ] = useState('surge');
    const [ hospitalId ] = useState('HOSP-001');

    const tabs = [
        { id: 'surge', label: '🚨 Surge Alert', icon: '🚨' },
        { id: 'inventory', label: '📦 Inventory', icon: '📦' },
        { id: 'staffing', label: '👥 Staffing', icon: '👥' },
        { id: 'beds', label: '🛏️ Beds', icon: '🛏️' },
        { id: 'orders', label: '📋 Orders', icon: '📋' }
    ];

    return (
        <div className="app">
            <Header />

            <div className="main-container">
                {/* Tab Navigation */}
                <div className="tabs-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Split Panel Layout */}
                <div className="split-layout">
                    {/* Left Panel - Data Dashboard */}
                    <div className="left-panel">
                        {activeTab === 'surge' && <SurgePredictionDashboard hospitalId={hospitalId} />}
                        {activeTab === 'inventory' && <InventoryTab hospitalId={hospitalId} />}
                        {activeTab === 'staffing' && <StaffingTab hospitalId={hospitalId} />}
                        {activeTab === 'beds' && <BedCapacityTab hospitalId={hospitalId} />}
                        {activeTab === 'orders' && <OrdersTab hospitalId={hospitalId} />}
                    </div>

                    {/* Right Panel - AI Chat */}
                    <div className="right-panel">
                        <AIChat hospitalId={hospitalId} activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
