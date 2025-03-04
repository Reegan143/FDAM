import React, { useEffect, useState, useContext } from "react";
import { Card, Toast, ToastContainer } from "react-bootstrap";
import API from "../utils/axiosInstance";
import AuthContext from "../context/authContext";
import Header from "../dashboard/header/header";
import VendorSidebar from "../dashboard/sideBar/vendorSidebar";

const ApiKeys = () => {
  const [apiKeyData, setApiKeyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { token } = useContext(AuthContext);

  // Add Notifications
  const addNotification = (message, variant = "success") => {
    const newNotification = { id: Date.now(), message, variant };
    setNotifications((prev) => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
    }, 3000);
  };

  // Fetch API Keys with transaction details
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await API.vendor.get("/vendor/get-api-key");
        
        if (response.data.apiKey) {
          // Assuming the API returns an array of objects with both API key and transaction ID
          setApiKeyData(response.data.apiKey);
        } else {
          setApiKeyData([]);
        }
      } catch (error) {
        addNotification(error.response?.data?.error || "Error fetching API Keys", "danger");
        setApiKeyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
    if (token) {
      setInterval(fetchApiKeys, 5000)
    }
  }, [token]);

  // Decode Selected API Key
  const handleDecodeApiKey = async (apiKey) => {
    try {
      const response = await API.vendor.post(
        "/vendor/decode-apikey",
        { apiKey }
      );

      if (!response.data.decodedApiKey) {
        throw new Error("Invalid API Key");
      }

      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
        <html>
          <head>
            <title>Decoded API Key Data</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          </head>
          <body class="container mt-4">
            <h2>Decoded API Key Data</h2>
            <table class="table table-striped mt-4">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(response.data.decodedApiKey.isTransaction).map(([key, value]) => `
                  <tr>
                    <td><strong>${key}</strong></td>
                    <td>${value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      newWindow.document.close();
    } catch (error) {
      addNotification(error.response?.data?.error || "Error decoding API Key", "danger");
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
  {/* Fixed header */}
  <div className="fixed-top">
    <Header />
  </div>
  
  {/* Content area with proper spacing */}
  <div className="d-flex flex-column flex-md-row" style={{ marginTop: "56px" }}>
    {/* Sidebar component */}
    <VendorSidebar />
    
    {/* Toast notifications */}
    <ToastContainer 
      position="top-end" 
      className="p-3" 
      style={{ 
        zIndex: 9999, 
        position: 'fixed',
        top: '66px',
        right: '10px',
        width: 'auto',
        maxWidth: 'calc(100vw - 20px)'
      }}
    >
      {notifications.map((notification) => (
        <Toast 
          key={notification.id} 
          bg={notification.variant} 
          autohide
          delay={5000}
          className="shadow-sm mb-2"
        >
          <Toast.Header closeButton={false} className="d-flex justify-content-between">
            <strong className="me-auto">Notification</strong>
            <small>{new Date().toLocaleTimeString()}</small>
          </Toast.Header>
          <Toast.Body className={notification.variant === 'danger' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>

    {/* Main content area */}
    <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: "0" }}>
      <div className="container-fluid px-0">
        <div className="content-area">
          <h1 className="h2 mb-2">Requested Transaction</h1>
          <p className="mb-4">View and decode your approved API Keys.</p>

          <Card className="shadow-sm">
            <Card.Body className="p-3 p-md-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h5 className="text-muted">Loading your API keys...</h5>
                </div>
              ) : apiKeyData.length > 0 ? (
                <div>
                  <h5 className="mb-3">Your API Keys:</h5>
                  <div className="list-group">
                    {apiKeyData.map((item, index) => (
                      <button
                        key={index}
                        className="list-group-item list-group-item-action d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3"
                        onClick={() => handleDecodeApiKey(item.apiKey)}
                      >
                        <span className="mb-2 mb-md-0">Transaction ID: {item.transactionId}</span>
                        <small className="text-primary d-flex align-items-center">
                          <i className="fas fa-key me-2"></i>
                          Click to view details
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-key fa-3x text-muted mb-3"></i>
                  <h5 className="text-danger mb-2">No API Keys Found</h5>
                  <p className="text-muted mb-0">Request API keys from the disputes section.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </main>
  </div>
</div>
  );
};

export default ApiKeys;