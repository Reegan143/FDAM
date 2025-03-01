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
        const response = await API.vendor.get("/vendor/get-api-key", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
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
        { apiKey },
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <VendorSidebar />

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {notifications.map((notification) => (
          <Toast key={notification.id} bg={notification.variant} autohide>
            <Toast.Header closeButton={false}>
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{notification.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      <main className="ms-250 pt-5 mt-4">
        <div className="container-fluid">
          <div className="content-area">
            <h1>Requested Transaction</h1>
            <p>View and decode your approved API Keys.</p>

            <Card className="shadow-sm p-4 mt-4">
              {loading ? (
                <h4 className="text-center">Loading...</h4>
              ) : apiKeyData.length > 0 ? (
                <div>
                  <h5>Your API Keys:</h5>
                  <div className="list-group mt-3">
                    {apiKeyData.map((item, index) => (
                      <button
                        key={index}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => handleDecodeApiKey(item.apiKey)}
                      >
                        <span>Transaction ID: {item.transactionId}</span>
                        <small className="text-muted">Click to view details</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h5 className="text-danger">No API Keys Found</h5>
                  <p className="text-muted">Request API keys from the disputes section.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiKeys;