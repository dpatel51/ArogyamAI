import React from 'react';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="header-title">
                        <span className="header-icon">🏥</span>
                        Hospital Surge Management System
                    </h1>
                </div>
                <div className="header-right">
                    <div className="header-status">
                        <span className="status-dot"></span>
                        <span>System Online</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
