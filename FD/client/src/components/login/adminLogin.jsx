import React, { useContext, useState, useEffect } from 'react'
import { Button, Form, Container, Row, Col, Alert, Navbar, Modal } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate, Link } from 'react-router-dom'
import AuthContext from '../context/authContext'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [error, setErrorMessage] = useState('')
  const [loading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalTitle, setModalTitle] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    const currentPath = window.location.pathname
    const lastPath = sessionStorage.getItem('lastPath')
    const hasReloaded = sessionStorage.getItem('hasReloaded')

    if (currentPath !== lastPath || !hasReloaded) {
      sessionStorage.setItem('lastPath', currentPath)
      sessionStorage.setItem('hasReloaded', 'true')
      window.location.reload()
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { email, password } = formData
    if (!email || !password) {
      setErrorMessage('Please fill in both fields')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('http://52.91.251.247:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setModalTitle('Success')
        setModalMessage('Login successful')
        setShowModal(true)
        
        if (data.message === 'success') {
          login(data.token)
          sessionStorage.removeItem('hasReloaded')
          sessionStorage.removeItem('lastPath')
          setTimeout(() => {
            navigate('/admin/dashboard')
          }, 500)
        }
      } else {
        setModalTitle('Error')
        setModalMessage(data || 'User Not Found')
        setShowModal(true)
      }
    } catch (error) {
      setModalTitle('Error')
      setModalMessage('An error occurred. Please try again later.')
      setShowModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <div style={{ paddingTop: '70px' }}>
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

      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="bg-white p-4 shadow rounded">
              <h2 className="text-center mb-3">Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    placeholder="Enter Your Email Address" 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password" 
                    placeholder="Enter Your Password" 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Login'}
                  </Button>
                </div>
                <div className="text-center mt-3">
                  <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                  </p>
                  <Link to="/reset-password">Forgot Password?</Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminLoginPage