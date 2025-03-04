import React, { useState, useEffect, useContext } from "react";
import Header from "../dashboard/header/header";
import Sidebar from "../dashboard/sideBar/sidebar";
import AuthContext from "../context/authContext";
import API from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { formatCurrency } from '../utils/currencyFormatter';


function UserTransaction() {
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

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
        <h1 className="h2 mb-4">Transactions</h1>
        
        {/* Search bar for desktop (above table) */}
        <div className="d-none d-md-block mb-4">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by Transaction ID" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        
        {/* Responsive table container */}
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="d-none d-md-table-cell">Sender's Name</th>
                <th className="d-none d-md-table-cell">Receiver's Name</th>
                <th className="d-none d-lg-table-cell">Debit Card Number</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .filter(tx => tx.transactionId.toString().includes(searchQuery))
                .map((tx, index) => (
                <tr key={index}>
                  <td className="text-nowrap">{tx.transactionId}</td>
                  <td>{formatCurrency(tx.transactionAmount)}</td>
                  <td>
                    <span className={
                      tx.status === 'completed' ? 'badge bg-success' : 
                      tx.status === 'pending' ? 'badge bg-warning text-dark' : 
                      'badge bg-secondary'
                    }>
                      {tx.status}
                    </span>
                  </td>
                  <td className="d-none d-md-table-cell">{tx.senderName}</td>
                  <td className="d-none d-md-table-cell">{tx.receiverName}</td>
                  <td className="d-none d-lg-table-cell">{tx.debitCardNumber}</td>
                  <td className="text-nowrap">{new Date(tx.transactionDate).toLocaleDateString()}</td>
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
        
        {/* Mobile search bar */}
        <div className="d-md-none mt-4 mb-3">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Transaction ID" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-primary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile card view */}
        <div className="d-md-none mt-3">
          {transactions
            .filter(tx => tx.transactionId.toString().toString().includes(searchQuery))
            .map((tx, index) => (
            <div key={index} className="card mb-3 shadow-sm">
              <div className="card-body p-3">
                <h6 className="card-subtitle mb-2 text-muted">Transaction ID: {tx.transactionId}</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount:</span>
                  <strong>{formatCurrency(tx.transactionAmount)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Status:</span>
                  <span className={
                    tx.status === 'completed' ? 'text-success' : 
                    tx.status === 'pending' ? 'text-warning' : 
                    'text-secondary'
                  }>
                    {tx.status}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>From:</span>
                  <span>{tx.senderName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>To:</span>
                  <span>{tx.receiverName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Card:</span>
                  <span>{tx.debitCardNumber}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Date:</span>
                  <span>{new Date(tx.transactionDate).toLocaleString()}</span>
                </div>
                <Button
                  className="btn btn-primary w-100"
                  onClick={() => navigate('/disputeform', {   
                    state: {
                      transactionId: tx.transactionId,
                      debitCardNumber: tx.debitCardNumber
                    }
                  })}
                  size="sm"
                >
                  Raise Dispute
                </Button>
              </div>
            </div>
          ))}
          
          {/* No results message */}
          {searchQuery && 
           transactions.filter(tx => tx.transactionId.toString().toString().includes(searchQuery)).length === 0 && (
            <div className="alert alert-info mt-3">
              No transactions found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
</div>
    );
}

export default UserTransaction;
