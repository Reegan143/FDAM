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
  <style>
    {`
    ${globalCSS}
    
    /* Desktop sidebar styles */
    @media (min-width: 768px) {
      .sidebar-wrapper {
        width: 250px;
        min-width: 250px;
        height: calc(100vh - 56px);
        border-right: 1px solid #dee2e6;
        background-color: white;
        position: sticky;
        top: 56px;
        z-index: 1020;
      }
      
      .sidebar-nav {
        flex-direction: column !important;
        padding: 0.5rem;
      }
      
      .nav-link {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: #333;
        text-decoration: none;
        border-radius: 0.25rem;
        margin-bottom: 0.25rem;
      }
      
      .nav-link i {
        margin-right: 12px;
        font-size: 1.1rem;
        width: 20px;
        text-align: center;
      }
    }
    
    /* Mobile sidebar styles */
    @media (max-width: 767.98px) {
      .sidebar-wrapper {
        width: 100%;
        background-color: white;
        border-bottom: 1px solid #dee2e6;
        z-index: 1020;
        overflow-x: auto;
      }
      
      .sidebar-nav {
        display: flex;
        flex-direction: row !important;
        flex-wrap: nowrap;
        padding: 0.75rem 0.5rem;
        margin: 0;
        white-space: nowrap;
      }
      
      .nav-link {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.5rem 1rem;
        color: #333;
        text-decoration: none;
        border-radius: 0.25rem;
        margin-right: 0.5rem;
      }
      
      .nav-link i {
        margin-right: 0.5rem;
        font-size: 1rem;
      }
    }
    
    .nav-link:hover {
      background-color: rgba(13, 110, 253, 0.1);
    }
    
    .nav-link.active {
      background-color: #0d6efd;
      color: white;
    }
    
    /* Hide scrollbar but allow scrolling */
    .sidebar-nav::-webkit-scrollbar {
      display: none;
    }
    
    .sidebar-nav {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    `}
  </style>
  
  <div className="sidebar-wrapper">
    <nav className="sidebar-nav">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <i className={`${item.icon} me-2`}></i>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
</>
  );
};

export default VendorSidebar;