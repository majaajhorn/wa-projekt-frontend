<template>
    <div class="notification-bell">
      <div class="bell-icon" @click="toggleNotifications">
        <span class="icon">🔔</span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </div>
      
      <div v-if="showNotifications" class="notification-dropdown">
        <div class="notification-header">
          <h3>Notifications</h3>
          <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-btn">
            Mark all as read
          </button>
        </div>
        
        <div v-if="loading" class="notification-loading">
          Loading...
        </div>
        
        <div v-else-if="notifications.length === 0" class="no-notifications">
          No notifications
        </div>
        
        <div v-else class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification._id" 
            :class="['notification-item', !notification.isRead ? 'unread' : '']"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
            </div>
            <button 
              class="delete-btn" 
              @click.stop="deleteNotification(notification._id)"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'NotificationBell',
    setup() {
      const router = useRouter();
      const notifications = ref([]);
      const unreadCount = ref(0);
      const showNotifications = ref(false);
      const loading = ref(false);
      let refreshInterval = null;
      
      // Fetch notifications
      const fetchNotifications = async () => {
        try {
          loading.value = true;
          const response = await apiClient.get('/notifications/my-notifications');
          notifications.value = response.data;
          loading.value = false;
          
          // Update unread count
          unreadCount.value = notifications.value.filter(n => !n.isRead).length;
        } catch (error) {
          console.error('Error fetching notifications:', error);
          loading.value = false;
        }
      };
      
      // Fetch only unread count (more efficient for regular checks)
      const fetchUnreadCount = async () => {
        try {
          const response = await apiClient.get('/notifications/unread-count');
          unreadCount.value = response.data.count;
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };
      
      // Toggle notification panel
      const toggleNotifications = () => {
        showNotifications.value = !showNotifications.value;
        
        if (showNotifications.value) {
          fetchNotifications();
        }
      };
      
      // Close notifications when clicking outside
      const handleClickOutside = (event) => {
        const notificationElement = document.querySelector('.notification-bell');
        if (notificationElement && !notificationElement.contains(event.target)) {
          showNotifications.value = false;
        }
      };
      
      // Mark notification as read
      const markAsRead = async (notificationId) => {
        try {
          await apiClient.put(`/notifications/${notificationId}/mark-read`);
          // Update local state
          const notification = notifications.value.find(n => n._id === notificationId);
          if (notification) {
            notification.isRead = true;
            unreadCount.value = notifications.value.filter(n => !n.isRead).length;
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      };
      
      // Mark all notifications as read
      const markAllAsRead = async () => {
        try {
          await apiClient.put('/notifications/mark-all-read');
          // Update local state
          notifications.value.forEach(notification => {
            notification.isRead = true;
          });
          unreadCount.value = 0;
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      };
      
      // Delete notification
      const deleteNotification = async (notificationId) => {
        try {
          await apiClient.delete(`/notifications/${notificationId}`);
          // Update local state
          notifications.value = notifications.value.filter(n => n._id !== notificationId);
          unreadCount.value = notifications.value.filter(n => !n.isRead).length;
        } catch (error) {
          console.error('Error deleting notification:', error);
        }
      };
      
      // Handle notification click
      const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
          await markAsRead(notification._id);
        }
        
        // Navigate based on notification type
        if (notification.type === 'job_application' && notification.relatedId) {
          // Navigate to application details
          router.push(`/application-details/${notification.relatedId}`);
          showNotifications.value = false;
        }
      };
      
      // Format notification time
      const formatTime = (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        const date = new Date(timestamp);
        const diffSeconds = Math.floor((now - date) / 1000);
        
        // Less than a minute
        if (diffSeconds < 60) {
          return 'Just now';
        }
        
        // Less than an hour
        if (diffSeconds < 3600) {
          const minutes = Math.floor(diffSeconds / 60);
          return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        // Less than a day
        if (diffSeconds < 86400) {
          const hours = Math.floor(diffSeconds / 3600);
          return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        // Less than a week
        if (diffSeconds < 604800) {
          const days = Math.floor(diffSeconds / 86400);
          return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
        
        // Format as date
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: numeric
        });
      };
      
      // Set up event listeners and fetch data on mount
      onMounted(() => {
        document.addEventListener('click', handleClickOutside);
        
        // Initial fetch
        fetchUnreadCount();
        
        // Set up regular polling for new notifications
        refreshInterval = setInterval(fetchUnreadCount, 60000); // Check every minute
      });
      
      // Clean up on unmount
      onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      });
      
      return {
        notifications,
        unreadCount,
        showNotifications,
        loading,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick,
        formatTime
      };
    }
  };
  </script>
  
  <style scoped>
  .notification-bell {
    position: relative;
  }
  
  .bell-icon {
    position: relative;
    cursor: pointer;
    padding: 8px;
  }
  
  .icon {
    font-size: 20px;
  }
  
  .badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #f56565;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    min-width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    font-weight: bold;
  }
  
  .notification-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 320px;
    max-height: 400px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .notification-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .mark-all-btn {
    background: none;
    border: none;
    color: #4299e1;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
  }
  
  .mark-all-btn:hover {
    text-decoration: underline;
  }
  
  .notification-loading, .no-notifications {
    padding: 20px;
    text-align: center;
    color: #718096;
  }
  
  .notification-list {
    overflow-y: auto;
    max-height: 350px;
  }
  
  .notification-item {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    transition: background-color 0.2s;
  }
  
  .notification-item:hover {
    background-color: #f7fafc;
  }
  
  .notification-item.unread {
    background-color: #ebf8ff;
  }
  
  .notification-item.unread:hover {
    background-color: #e6f7ff;
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .notification-message {
    font-size: 13px;
    color: #4a5568;
    margin-bottom: 6px;
  }
  
  .notification-time {
    font-size: 11px;
    color: #718096;
  }
  
  .delete-btn {
    background: none;
    border: none;
    color: #a0aec0;
    font-size: 14px;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .notification-item:hover .delete-btn {
    opacity: 1;
  }
  
  .delete-btn:hover {
    color: #f56565;
  }
  </style>