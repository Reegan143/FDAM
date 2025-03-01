import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const VendorSidebar = () => {
  const menuItems = [
    { path: '/vendor/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/vendor/api-keys', icon: 'fas fa-lock', label: 'Fetch Transaction Details' }
  ];

  const sidebarStyle = {
    position: 'fixed',
    top: '76px',
    left: 0,
    bottom: 0,
    width: '250px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #dee2e6',
    overflowY: 'auto',
    zIndex: 1000
  };

 
  const mainContentClass = 'ms-250'; 


  const globalCSS = `
    .ms-250 {
      margin-left: 250px;
    }
    
    .nav-link {
      color: #333;
      padding: 0.8rem 1rem;
      transition: all 0.3s;
    }
    
    .nav-link:hover, .nav-link.active {
      background-color: #e9ecef;
      color: #0d6efd;
    }
    
    .nav-link i {
      width: 20px;
      text-align: center;
      margin-right: 10px;
    }
  `;

  return (
    <>
      <style>{globalCSS}</style>
      <nav style={sidebarStyle}>
        <div className="nav flex-column">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
              }
            >
              <i className={`${item.icon} me-2`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default VendorSidebar;