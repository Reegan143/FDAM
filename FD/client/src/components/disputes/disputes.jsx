import React, { useState, useEffect } from 'react';
import API from '../utils/axiosInstance';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../dashboard/header/header';
import Sidebar from '../dashboard/sideBar/sidebar';

function DisputesForm() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendors, setVendors] = useState([]);
  const location = useLocation();

  const [formData, setFormData] = useState({
    complaintName: '',
    cuid: '',
    accountNumber: '',
    branchCode: '',
    branchName: '',
    digitalChannel: 'googlePay',
    complaintType: '',
    transactionId: '',
    description: '',
    debitCardNumber: '',
    email: '',
    vendorName: '',
    status: 'submitted', // Added to match model
    ticketNumber: null // Added to match model
  });

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const res = await API.user.get("/user/me");
            const user = res.data;
            const vendors = await API.user.get("/user/get-all-vendors")
            setVendors(vendors.data);

            // Pre-fill form with user data
            setFormData(prev => ({
                ...prev,
                complaintName: user.userName,
                cuid: user.cuid,
                accountNumber: user.accNo,
                branchCode: user.branchCode,
                branchName: user.branchName,
                email: user.email,
                // Pre-fill from navigation state if available
                ...(location.state && {
                    transactionId: location.state.transactionId.toString(),
                    debitCardNumber: location.state.debitCardNumber.toString()
                })
            }));
        } catch (error) {
            console.error("Error fetching user data:", error.response?.data?.error);
        }
    };
    fetchUserData();
}, [location.state]);
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }


    // Complaint type validation
    if (!formData.complaintType.trim()) {
      newErrors.complaintType = 'Complaint type is required';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }


    // Transaction ID validation (10 digits)
    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    } else if (!/^\d{10}$/.test(formData.transactionId)) {
      newErrors.transactionId = 'Transaction ID must be exactly 10 digits';
    }

    // Debit card validation (16 digits)
    if (!formData.debitCardNumber.trim()) {
      newErrors.debitCardNumber = 'Debit card number is required';
    } else if (!/^\d{16}$/.test(formData.debitCardNumber)) {
      newErrors.debitCardNumber = 'Debit card number must be exactly 16 digits';
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
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      setNotification({
        type: 'danger',
        message: 'Please correct the errors before submitting.'
      });
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      transactionId: parseInt(formData.transactionId),
      debitCardNumber: parseInt(formData.debitCardNumber),
      vendorName: formData.vendorName.toLowerCase(),
      status: 'submitted'
    };

    try {
      const response = await API.utils.post("/disputes/disputeform", submitData);
      setNotification({
        type: 'success',
        message: response.data.message || 'Dispute submitted successfully!'
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      let errorMessage = 'Failed to submit dispute form.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setNotification({
        type: 'danger',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current datetime for max value
  const now = new Date().toISOString().slice(0, 16);

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
        <div className="content-area">
          <h1 className="h2 mb-3">Raise Disputes</h1>
          
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h2 className="h5 mb-0 text-center text-md-start">Complaint Registration Form</h2>
            </div>
            <div className="card-body p-3 p-md-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Digital Channel <span className="text-danger">*</span></Form.Label>
                      <Form.Select 
                        name="digitalChannel" 
                        value={formData.digitalChannel} 
                        onChange={handleChange} 
                        required
                      >
                        <option value="googlePay">Google Pay</option>
                        <option value="paytm">Paytm</option>
                        <option value="phonePe">PhonePe</option>
                        <option value="amazonPay">Amazon Pay</option>
                        <option value="bhimUpi">BHIM UPI</option>
                        <option value="razorPay">RazorPay</option>
                        <option value="mobiKwik">MobiKwik</option>
                        <option value="freeCharge">FreeCharge</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Complaint Type <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="complaintType" 
                        value={formData.complaintType} 
                        onChange={handleChange} 
                        isInvalid={!!errors.complaintType} 
                        required 
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.complaintType}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Transaction ID <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="transactionId" 
                        value={formData.transactionId} 
                        readOnly
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.transactionId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Debit Card Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="debitCardNumber" 
                        value={formData.debitCardNumber} 
                        readOnly
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.debitCardNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Vendor <span className="text-danger">*</span></Form.Label>
                      <Form.Select 
                        name="vendorName" 
                        value={formData.vendorName} 
                        onChange={handleChange} 
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option 
                            key={vendor._id} 
                            value={vendor.vendorName}
                          >
                            {vendor.vendorName.charAt(0).toUpperCase() + vendor.vendorName.slice(1)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={4} 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        isInvalid={!!errors.description} 
                        required 
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="mt-4">
                  {notification.message && (
                    <Alert variant={notification.type} dismissible className="mb-3">
                      {notification.message}
                    </Alert>
                  )}
                  <div className="d-grid d-md-flex justify-content-md-center">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-4 py-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : 'Submit'}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
  );
}

export default DisputesForm;