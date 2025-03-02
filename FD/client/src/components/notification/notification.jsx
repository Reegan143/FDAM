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
      transition={{ duration: 0.3 }}
      className="position-fixed shadow-lg notification-popup"
      style={{ 
        width: "100%", 
        maxWidth: "380px", 
        zIndex: 2000,
        top: "56px", /* Height of your header */
        right: "0",
        bottom: "auto",
        left: "auto"
      }}
    >
      <Card className="border-0 rounded-0 rounded-bottom-lg overflow-hidden">
        <div className="bg-primary text-white p-2 p-sm-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Bell size={18} className="me-2" />
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <Badge bg="danger" className="ms-2" style={{ fontSize: "0.7rem" }}>
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button 
            variant="link" 
            className="text-white p-0 d-flex align-items-center justify-content-center" 
            onClick={onClose}
            aria-label="Close notifications"
            style={{ width: "32px", height: "32px" }}
          >
            <X size={18} />
          </Button>
        </div>
        
        <div 
          className="notification-container" 
          style={{ 
            maxHeight: "min(400px, calc(100vh - 120px))", 
            overflowY: "auto",
            overscrollBehavior: "contain"
          }}
        >
          {notifications.length === 0 ? (
            <div className="text-center p-4">
              <Bell size={32} className="text-muted mb-2" />
              <p className="text-muted mb-0">No notifications available</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-2 p-sm-3 border-bottom ${
                  notification.isRead ? 'bg-white' : 'bg-light'
                }`}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 pe-2">
                    <div className="d-flex flex-column flex-sm-row align-items-sm-center mb-1">
                      <div>
                        <span className="badge bg-primary me-2">
                          #{notification.ticketNumber}
                        </span>
                        <small className="text-muted">
                          {notification.complaintType}
                        </small>
                      </div>
                      <small className="text-muted mt-1 mt-sm-0 ms-sm-auto" style={{ fontSize: "0.7rem" }}>
                        {formatDate(notification.createdAt)}
                      </small>
                    </div>
                    <p className="mb-0 text-dark small">
                      {notification.messages}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn btn-outline-success btn-sm p-1 ms-1 d-flex align-items-center justify-content-center"
                      onClick={() => markAsRead(notification._id)}
                      aria-label="Mark as read"
                      style={{ minWidth: "32px", height: "32px", flexShrink: 0 }}
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