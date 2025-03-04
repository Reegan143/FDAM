import React, { useState, useContext, useEffect } from "react";
import Header from "./dashboard/header/header";
import Sidebar from "./dashboard/sideBar/sidebar";
import {setAuthToken} from "./utils/axiosInstance";
import AuthContext from "./context/authContext";
import API from "./utils/axiosInstance"


function DisputeStatus() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [dispute, setDispute] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token } = useContext(AuthContext); 

    
    useEffect(() => {
        if (token) {
          setAuthToken(() => token);
        }
      }, [token]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setDispute(null);

        try {
            const response = await API.utils.post("/disputes/dispute-status", { ticketNumber });
            setDispute(response.data);
        } catch (error) {
            setError(error.response?.data?.error || "Error fetching dispute details");
        } finally {
            setLoading(false);
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
    <Sidebar />
    
    {/* Main content area */}
    <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: "0" }}>
      <div className="container-fluid px-0">
        <div className="content-area">
          <h1 className="h2 mb-4">Dispute Status Tracking</h1>
          
          {/* Responsive search form */}
          <div className="mb-4">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Ticket Number"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-auto">
                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleSearch} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Searching...
                    </>
                  ) : "Search"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && <div className="alert alert-danger">{error}</div>}
          
          {/* Dispute details card */}
          {dispute && (
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="card-title h5 mb-0">Dispute Details</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <p className="mb-2">
                      <strong className="text-muted">Ticket Number:</strong><br />
                      {dispute.ticketNumber}
                    </p>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <p className="mb-2">
                      <strong className="text-muted">Transaction ID:</strong><br />
                      {dispute.transactionId}
                    </p>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <p className="mb-2">
                      <strong className="text-muted">Amount Disputed:</strong><br />
                      ${dispute.amount}
                    </p>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <p className="mb-2">
                      <strong className="text-muted">Date:</strong><br />
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <p className="mb-2">
                      <strong className="text-muted">Complaint Type:</strong><br />
                      {dispute.complaintType}
                    </p>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <p className="mb-2">
                      <strong className="text-muted">Status:</strong><br />
                      <span className={`badge ${
                        dispute.status === 'Approved' ? 'bg-success' : 
                        dispute.status === 'Rejected' ? 'bg-danger' : 
                        'bg-warning text-dark'
                      }`}> 
                        {dispute.status}
                      </span>
                    </p>
                  </div>
                  <div className="col-12 mb-2">
                    <p className="mb-1">
                      <strong className="text-muted">Description:</strong>
                    </p>
                    <p className="border rounded p-3 bg-light">
                      {dispute.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* No results state */}
          {!dispute && !loading && ticketNumber && !error && (
            <div className="text-center p-4 mt-4">
              <div className="text-muted mb-3">
                <i className="fas fa-search fa-3x mb-3"></i>
                <p>No dispute found with this ticket number.</p>
              </div>
              <button className="btn btn-outline-primary" onClick={() => setTicketNumber('')}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
</div>
    );
}

export default DisputeStatus;
