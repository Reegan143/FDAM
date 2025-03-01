import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionForm from './components/trsanactionForm/transactionForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TransactionForm />} />
      </Routes>
    </Router>
  );
}

export default App;