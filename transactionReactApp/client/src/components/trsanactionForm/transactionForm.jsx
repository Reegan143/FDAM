import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import generateTenDigitTransactionId from '../utils/createTransactionId';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    senderAccNo: '',
    receiverAccNo: '',
    amount: '',
    debitCardNumber: '',
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const createTransactionId = generateTenDigitTransactionId
      const transactionId = await createTransactionId()
      const status  = 'paid'
      const response = await axios.post('http://localhost:8003/api/transactions/make', {...formData, transactionId, status}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const senderName = response.data.senderName
      const receiverName = response.data.receiverName
      console.log(senderName, receiverName)

      console.log(response.data)
      await axios.post('http://localhost:5001/api/transactions/store', {...formData, transactionId, status, senderName, receiverName})

      setMessage(`Transaction initiated successfully! Transaction ID: ${response.data.transactionId}`);
      setError('');
      setFormData({
        senderAccNo: '',
        receiverAccNo: '',
        amount: '',
        debitCardNumber: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while making the transaction.');
      setMessage('');
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow">
        <Card.Body>
          <Card.Title className="text-center mb-4">Create a New Transaction</Card.Title>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Sender Account Number</Form.Label>
              <Form.Control
                type="number"
                name="senderAccNo"
                value={formData.senderAccNo}
                onChange={handleChange}
                placeholder="Enter Sender Account Number"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Receiver Account Number</Form.Label>
              <Form.Control
                type="number"
                name="receiverAccNo"
                value={formData.receiverAccNo}
                onChange={handleChange}
                placeholder="Enter Receiver Account Number"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter Amount"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Debit Card Number</Form.Label>
              <Form.Control
                type="number"
                name="debitCardNumber"
                value={formData.debitCardNumber}
                onChange={handleChange}
                placeholder="Enter Debit Card Number"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Make Transaction
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TransactionForm;