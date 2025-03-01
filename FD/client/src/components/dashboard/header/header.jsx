import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion} from 'framer-motion';
import { Navbar, Container, Nav, Button, Badge} from 'react-bootstrap';
import { Bell} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AuthContext from '../../context/authContext';
import API from "../../utils/axiosInstance";
import NotificationsPopup from "../../notification/notification";



const Header = () => {
  const { logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchNotifications()
      setInterval(async () => {
        await fetchNotifications();
      }, 5000);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await API.utils.get("/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.utils.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    window.location.reload();
  };

  const handleHomeClick = () => {
    navigate("/");
    window.location.reload();
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    navigate('/user/settings');
  };

  return (
    <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand onClick={handleHomeClick} style={{ cursor: 'pointer' }} className="d-flex align-items-center">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="https://mma.prnewswire.com/media/2171380/Brillio_Logo.jpg?p=twitter"
            alt="Brillian Bank"
            height="40"
            className="me-2"
          />
          <motion.span
            whileHover={{ color: '#0056b3' }}
          >
            Brillian Bank
          </motion.span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="link" 
                className="me-1" 
                onClick={handleSettingsClick}
                data-testid="settings-button"
              >
                <i className="fas fa-user"></i>
              </Button>
            </motion.div>

            <div className="position-relative" ref={notificationRef}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="link" 
                  className="position-relative me-3" 
                  onClick={toggleNotifications}
                  data-testid="notification-toggle"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge 
                      pill 
                      bg="danger" 
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </motion.div>

              <NotificationsPopup
                showNotifications={showNotifications}
                notifications={notifications}
                markAsRead={markAsRead}
                onClose={() => setShowNotifications(false)}
                unreadCount={unreadCount}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="danger" 
                onClick={handleLogout} 
                className="me-2"
              >
                Logout
              </Button>
            </motion.div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;