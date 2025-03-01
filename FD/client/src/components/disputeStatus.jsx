import React, { useState, useContext, useEffect } from "react";
import Header from "./dashboard/header/header";
import Sidebar from "./dashboard/sideBar/sidebar";
import {setAuthToken} from "./utils/axiosInstance";
import AuthContext from "./context/authContext";
import ChatBubble from "./chatbot/ChatBubble";
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
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <Sidebar />
            <main className="ms-250 pt-5 mt-4">
                <div className="container-fluid">
                    <div className="content-area">
                        <h1>Dispute Status Tracking</h1>
                        <div className="mb-4">
                            <input
                                type="text"
                                className="form-control w-50 d-inline-block me-2"
                                placeholder="Enter Ticket Number"
                                value={ticketNumber}
                                onChange={(e) => setTicketNumber(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {dispute && (
                            <div className="card p-3 mt-3 shadow">
                                <h4>Dispute Details</h4>
                                <p><strong>Ticket Number:</strong> {dispute.ticketNumber}</p>
                                <p><strong>Transaction ID:</strong> {dispute.transactionId}</p>
                                <p><strong>Amount Disputed:</strong> ${dispute.amount}</p>
                                <p><strong>Date:</strong> {new Date(dispute.createdAt).toLocaleDateString()}</p>
                                <p><strong>Complaint Type:</strong> {dispute.complaintType}</p>
                                <p><strong>Description:</strong> {dispute.description}</p>
                                <p>
                                    <strong>Status:</strong> 
                                    <span className={`badge ${dispute.status === 'Approved' ? 'success' : dispute.status === 'Rejected' ? 'danger' : 'bg-warning'}`}> 
                                        {dispute.status}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <ChatBubble/>

            </main>
        </div>
    );
}

export default DisputeStatus;
