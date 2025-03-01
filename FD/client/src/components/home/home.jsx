import React from 'react';
import { Container, Row, Col, Card, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContact = () => {
    navigate('/contact'); // Assumes you have a contact page
  };

  return (
    <div className="home-page d-flex flex-column min-vh-100">
      {/* Navigation Bar */}
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img
              src="https://mma.prnewswire.com/media/2171380/Brillio_Logo.jpg?p=twitter"
              height="40"
              className="d-inline-block align-top me-2"
              alt="Brillian Bank Logo"
            />
            <span className="fw-bold">Brillian Bank</span>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-primary btn-pulse" onClick={handleLogin}>
              Login
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="hero-section text-white text-center d-flex align-items-center justify-content-center">
        <Container>
          <h1 className="display-3 hero-title">Welcome to Brillian Bank</h1>
          <p className="lead hero-subtitle">
            Your trusted partner for managing disputes and delivering exceptional banking services.
          </p>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="flex-grow-1 my-5">
        {/* About Section */}
        <Row className="justify-content-center mb-5">
          <Col xs={12} md={10} lg={8}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Card.Body>
                <h2 className="card-title">About Brillian Bank</h2>
                <Card.Text>
                  Brillian Bank is a leading financial institution with over 20 years of experience, dedicated to providing innovative solutions for all your financial needs. Our commitment to excellence, transparency, and customer satisfaction has established us as a trusted partner in the banking industry.
                </Card.Text>
                <Card.Text>
                  We pride ourselves on our cutting-edge digital banking services, robust dispute management system, and personalized approach that caters to both individual and business banking requirements.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Why Choose Us Section */}
        <Row className="justify-content-center mb-5">
          <Col xs={12} md={10} lg={8}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Card.Body>
                <h2 className="card-title">Why Choose Our Dispute Management System?</h2>
                <Row>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li>✓ Fast response time</li>
                      <li>✓ Efficient tracking of disputes</li>
                      <li>✓ Real-time notifications and updates</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li>✓ 24/7 support</li>
                      <li>✓ Secure and confidential handling</li>
                      <li>✓ Easy-to-use platform</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Our Services Section */}
        <Row className="text-center mb-5">
          <Col xs={12}>
            <h2 className="mb-4 section-title fadeInUp" style={{ animationDelay: '0.3s' }}>
              Our Services
            </h2>
          </Col>
          <Col md={4}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Card.Body>
                <h3 className="card-title">Personal Banking</h3>
                <Card.Text>
                  Tailored solutions for your personal finances, including savings, loans, and investment services.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.5s' }}>
              <Card.Body>
                <h3 className="card-title">Business Banking</h3>
                <Card.Text>
                  Comprehensive services for businesses—from corporate accounts to merchant services and business loans.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Card.Body>
                <h3 className="card-title">Digital Banking</h3>
                <Card.Text>
                  Enjoy seamless online and mobile banking experiences with our state-of-the-art digital platform.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Testimonials Section */}
        <Row className="justify-content-center mb-5">
          <Col xs={12}>
            <h2 className="text-center mb-4 section-title fadeInUp" style={{ animationDelay: '0.3s' }}>
              Customer Testimonials
            </h2>
          </Col>
          <Col md={4}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Card.Body>
                <Card.Text>
                  "Brillian Bank has transformed my banking experience. Their customer service is exceptional and the digital tools are incredibly user-friendly."
                </Card.Text>
                <footer className="blockquote-footer">Jane Doe</footer>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.5s' }}>
              <Card.Body>
                <Card.Text>
                  "I trust Brillian Bank for all my business needs. Their innovative solutions and dedicated support have been invaluable."
                </Card.Text>
                <footer className="blockquote-footer">John Smith</footer>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 hover-animate shadow-lg fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Card.Body>
                <Card.Text>
                  "The digital banking platform is intuitive and efficient. I can manage my finances seamlessly on the go."
                </Card.Text>
                <footer className="blockquote-footer">Emily Johnson</footer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Contact Us Section */}
        <Row className="justify-content-center mb-5">
          <Col xs={12} md={10} lg={8} className="text-center">
            <h2 className="section-title fadeInUp" style={{ animationDelay: '0.3s' }}>Get in Touch</h2>
            <p className="lead fadeInUp" style={{ animationDelay: '0.4s' }}>
              Have questions or need assistance? Our dedicated team is here to help with all your banking needs.
            </p>
            <Button variant="primary btn-pulse fadeInUp" style={{ animationDelay: '0.5s' }} onClick={handleContact}>
              Contact Us
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3">
        <Container>
          <p className="mb-0">Brillian Bank &copy; 2025. All Rights Reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
