import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/axiosInstance';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserSettings = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await API.utils.get('/users/profile');
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" />
      </div>
    );
  }

  return (
    <Container className="mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">User Profile</h3>
            <Button variant="light" onClick={() => navigate(-1)}>Go Back</Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Name</h5>
                  <p className="font-semibold">{userData?.userName}</p>
                </motion.div>
              </Col>
              <Col md={6}>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Email</h5>
                  <p className="font-semibold">{userData?.email}</p>
                </motion.div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Account Number</h5>
                  <p className="font-semibold">{userData?.accNo}</p>
                </motion.div>
              </Col>
              <Col md={6}>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Customer ID</h5>
                  <p className="font-semibold">{userData?.cuid}</p>
                </motion.div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Branch Code</h5>
                  <p className="font-semibold">{userData?.branchCode}</p>
                </motion.div>
              </Col>
              <Col md={6}>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Branch Name</h5>
                  <p className="font-semibold">{userData?.branchName}</p>
                </motion.div>
              </Col>
              <Col md={6}>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Debit Card No</h5>
                  <p className="font-semibold">{userData?.debitCardNumber}</p>
                </motion.div>
              </Col>
              <Col md={6}>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-4"
                >
                  <h5 className="text-gray-600">Role</h5>
                  <p className="font-semibold">{userData?.role}</p>
                </motion.div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default UserSettings;
