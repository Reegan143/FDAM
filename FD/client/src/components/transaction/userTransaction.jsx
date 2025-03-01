import React, { useState, useEffect, useContext } from "react";
import Header from "../dashboard/header/header";
import Sidebar from "../dashboard/sideBar/sidebar";
import AuthContext from "../context/authContext";
import API from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { formatCurrency } from '../utils/currencyFormatter';
import ChatBubble from "../chatbot/ChatBubble";


function UserTransaction() {
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await API.utils.get(`/transactions`);
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        if (token) {
            fetchTransactions();
            setInterval(fetchTransactions, 5000);
        }
    }, [token]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <Sidebar />
            <main className="ms-250 pt-5 mt-4">
                <div className="container-fluid">
                    <h1>Transactions</h1>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Sender's Name</th>
                                <th>Receiver's Name</th>
                                <th>Debit Card Number</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={index}>
                                    <td>{tx.transactionId}</td>
                                    <td>{formatCurrency(tx.transactionAmount)}</td>
                                    <td>{tx.status}</td>
                                    <td>{tx.senderName}</td>
                                    <td>{tx.receiverName}</td>
                                    <td>{tx.debitCardNumber}</td>
                                    <td>{new Date(tx.transactionDate).toLocaleString()}</td>
                                    <td>
                                        <Button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => navigate('/disputeform', {   
                                                state: {
                                                    transactionId: tx.transactionId,
                                                    debitCardNumber: tx.debitCardNumber
                                                }
                                            })}
                                            style={{ 
                                                padding: '0.15rem 0.5rem',
                                                fontSize: '0.75rem'
                                              }}
                                        >
                                            Raise Dispute
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ChatBubble/>

            </main>
        </div>
    );
}

export default UserTransaction;
