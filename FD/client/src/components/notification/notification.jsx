import React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, Card } from 'react-bootstrap';
import { Bell, Check, X } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';



const NotificationsPopup = ({ 
  showNotifications, 
  notifications, 
  markAsRead, 
  onClose,
  unreadCount 

}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
  return (
    <AnimatePresence>
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="position-absolute end-0 mt-2 shadow-lg"
          style={{ width: "380px", zIndex: 1000 }}
        >
          <Card className="border-0 rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Bell size={20} className="me-2" />
                <h6 className="mb-0">Notifications</h6>
                {unreadCount > 0 && (
                  <Badge bg="danger" className="ms-2">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <Button 
                variant="link" 
                className="text-white p-0" 
                onClick={onClose}
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="notification-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div className="text-center p-4">
                  <Bell size={40} className="text-muted mb-2" />
                  <p className="text-muted">No notifications available</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 border-bottom ${
                      notification.isRead ? 'bg-white' : 'bg-light'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                            {formatDate(notification.createdAt)}
                        <div className="d-flex align-items-center mb-1">
                          <span className="badge bg-primary me-2">
                            #{notification.ticketNumber} <br></br>
                          </span>
                          <small className="text-muted">
                            {notification.complaintType}
                          </small>
                        </div>
                        <p className="mb-0 text-dark">
                          {notification.messages}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-outline-success btn-sm ms-2"
                          onClick={() => markAsRead(notification._id)}
                        >
                          <Check size={16} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPopup;