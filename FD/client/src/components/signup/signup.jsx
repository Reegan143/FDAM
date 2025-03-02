import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from "../utils/axiosInstance"
import './signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accNo: "",
    cuid: '',
    branchCode: '',
    branchName: '',
    debitCardNumber :'',
    cardType : '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if(!formData.debitCardNumber || formData.debitCardNumber.length !== 16) {
      newErrors.debitCardNumber = 'Invalid Debit Card Number';
    }
    
    if(!formData.accNo || formData.accNo.length !== 12) {
      newErrors.accNo = 'Invalid Account Number';
    }
    if(!formData.cuid || formData.cuid.length!== 8) {
      newErrors.cuid = 'Invalid Customer ID';
    }
    if(!formData.cardType){
      newErrors.cardType = 'Card Type is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await API.auth.post('/auth', {
          userName: formData.name,
          email: formData.email,
          password: formData.password,
          accNo: formData.accNo,
          cuid: formData.cuid,
          branchCode: formData.branchCode,
          branchName: formData.branchName,
          debitCardNumber: formData.debitCardNumber,
          cardType: formData.cardType.toLowerCase()
        });
        
        setTimeout(()=>{
          navigate('/login');
        },500)
        
      } catch (error) {
        setApiError(error.response?.data?.error || 'An error occurred during signup');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ paddingTop: '70px' }}> {/* Add padding to account for fixed navbar */}
      {/* Fixed Navigation Bar */}
      <Navbar 
        bg="white" 
        className="border-bottom px-4 py-3"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
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

      {/* Signup Form */}
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="shadow signup-card">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Sign Up</h2>
                
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                      placeholder="Enter your name"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Account Number :</Form.Label>
                    <Form.Control
                      type="number"
                      name="accNo"
                      value={formData.accNo}
                      onChange={handleChange}
                      isInvalid={!!errors.accNo}
                      placeholder="Enter your Account Number"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.accNo}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>CUID :</Form.Label>
                    <Form.Control
                      type="number"
                      name="cuid"
                      value={formData.cuid}
                      onChange={handleChange}
                      isInvalid={!!errors.cuid}
                      placeholder="Enter your CUID Number"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.cuid}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Branch Code : </Form.Label>
                    <Form.Control
                      type="branchCode"
                      name="branchCode"
                      value={formData.branchCode}
                      onChange={handleChange}
                      isInvalid={!!errors.branchCode}
                      placeholder="Enter your Branch Code"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.branchCode}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Branch Name : </Form.Label>
                    <Form.Control
                      type="branchName"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      isInvalid={!!errors.branchName}
                      placeholder="Enter your Branch Name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.branchName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Debit Card No : </Form.Label>
                    <Form.Control
                      type="debitCardNumber"
                      name="debitCardNumber"
                      value={formData.debitCardNumber}
                      onChange={handleChange}
                      isInvalid={!!errors.debitCardNumber}
                      placeholder="Enter your Debit Card Number"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.debitCardNumber}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Card Type : </Form.Label>
                    <Form.Select
                      name="cardType"
                      value={formData.cardType}
                      onChange={handleChange}
                      >

                      <option value="">Select Card Type</option>
                      <option value="master card">Master Card</option>
                      </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.cardType}
                    </Form.Control.Feedback>      
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="Enter your email"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Enter password"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      placeholder="Confirm your password"
                      />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {apiError && (
                    <Alert variant="danger" className="mb-4">
                      {apiError}
                    </Alert>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                  
                  <div className="text-center">
                    Already have an account?{' '}
                    <Link to="/login">Login here</Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;