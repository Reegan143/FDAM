import React, { useState, useEffect, useContext } from "react";
import Header from "../dashboard/header/header";
import AuthContext from "../context/authContext";
import API from "../utils/axiosInstance";
import VendorSidebar from "../dashboard/sideBar/vendorSidebar";

function VendorTransaction() {
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await API.utils.get(`/transactions`);
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        if (token) fetchTransactions();
    }, [token]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <VendorSidebar />
            <main className="ms-250 pt-5 mt-4">
                <div className="container-fluid">
                    <h1>Transactions</h1>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Sender Account</th>
                                <th>Receiver Account</th>
                                <th>Debit Card Number</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={index}>
                                    <td>{tx.transactionId}</td>
                                    <td>${tx.transactionAmount}</td>
                                    <td>{tx.status}</td>
                                    <td>{tx.senderAccNo}</td>
                                    <td>{tx.receiverAccNo}</td>
                                    <td>{tx.debitCardNumber}</td>
                                    <td>{new Date(tx.transactionDate).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default VendorTransaction;
