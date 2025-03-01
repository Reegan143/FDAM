import React, { useState,Link } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from "../utils/axiosInstance"

const ResetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await API.user.post('user/verify-otp', {
        email,
        otp,
        newPassword
      });
      setMessage(response.data.message);
      setTimeout(()=>{
      navigate('/login');

      },2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setIsLoading(false);
  };

  return (

    <div style={{ paddingTop: '56px' }}> {/* Reduced padding to match navbar height */}
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
              <h3 className="text-center">Reset Your Password</h3>
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
                <Form.Group controlId="otp" className="mt-3">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="newPassword" className="mt-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3" disabled={isLoading}>
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </Form>
              {message && <Alert variant="success" className="mt-3">{message}</Alert>}
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default ResetPasswordForm;
