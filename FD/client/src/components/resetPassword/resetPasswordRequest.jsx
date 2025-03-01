import React, { useState } from 'react';
import API from "../utils/axiosInstance"
import { Container, Row, Col, Card, Form, Button, Alert, Navbar } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await API.user.post('/user/reset-Password', { email });
      setMessage(response.data.message);

      setTimeout(() => {
        navigate('/reset-Password-Form');
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ paddingTop: '56px' }}> 
      <Navbar 
        bg="white" 
        className="border-bottom px-4 py-2"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '56px' /* Fixed height for navbar */
        }}
      >
        <Container fluid className="px-0">
          <Navbar.Brand 
            as={Link} 
            to="/" 
            className="d-flex align-items-center"
            style={{ cursor: 'pointer' }}
          >
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '1.25rem',
              marginRight: '0.5rem'
            }}>
              brillio
            </span>
            <span style={{ fontSize: '1.1rem' }}>
              Brillian Bank
            </span>
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <Card className="mt-4">
              <Card.Body>
                <h3 className="text-center">Reset Password</h3>
                {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="email">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="mt-3" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPasswordRequest;
