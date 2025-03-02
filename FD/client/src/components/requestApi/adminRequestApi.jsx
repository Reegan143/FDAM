import React, { useEffect, useState,useContext } from 'react';
import { Table, Button} from 'react-bootstrap';
import API from '../utils/axiosInstance';
import Header from '../dashboard/header/header';
import AdminSidebar from '../dashboard/sideBar/adminSidebar';
import AuthContext from '../context/authContext';



const APIKeyRequests = () => {
    const [requests, setRequests] = useState([]);
    const { token } = useContext(AuthContext); 
    

    useEffect(() => {
        if(token){
            fetchApiKeyRequests();
            setInterval(fetchApiKeyRequests, 5000);
        }
        
    }, [token]);

    const fetchApiKeyRequests = async () => {
        try {
            const res = await API.admin.get('/admin/api-key-requests');
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching API key requests:", error);
        }
    };

    const handleApprove = async (requestId,email, transactionId) => {
        try {
            await API.admin.patch('/admin/approve-api-key', { requestId,email, transactionId });
            fetchApiKeyRequests();
        } catch (error) {
            console.error("Error approving API key request:", error);
        }
    };

    const handleReject = async (requestId,email, transactionId) => {
        try {
            console.log(email)
            await API.admin.patch('/admin/reject-api-key', { requestId,email, transactionId });
            fetchApiKeyRequests();
        } catch (error) {
            console.error("Error rejecting API key request:", error);
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
      <AdminSidebar />
        <main className="flex-grow-1 pt-5 mt-4 px-3">
            <div className="container-fluid">
                <h1>API Key Requests</h1>
                <div className="table-responsive">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Vendor Name</th>
                                <th>Transaction ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request.email}>
                                    <td>{request.vendorName.toUpperCase()}</td>
                                    <td>{request.transactionId}</td>
                                    <td>{request.status}</td>
                                    <td>
                                        {request.status === 'pending' && (
                                            <>
                                                <Button 
                                                    variant="success" 
                                                    className="me-2 mb-1 mb-sm-0"
                                                    onClick={() => handleApprove(request._id,request.email, request.transactionId)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    className="mb-1 mb-sm-0"
                                                    onClick={() => handleReject(request._id, request.email, request.transactionId)}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </main>
    </div>
</div>
    );
};

export default APIKeyRequests;
