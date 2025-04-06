// Simple service to manage application status synchronization across components
export const applicationStatusService = {
    // Store application status updates
    storeStatusUpdate(applicationId, newStatus) {
      try {
        // Get existing updates
        let updates = localStorage.getItem('applicationStatusUpdates');
        updates = updates ? JSON.parse(updates) : {};
        
        // Add or update this application status
        updates[applicationId] = {
          status: newStatus,
          displayStatus: newStatus === 'Hired' ? 'Approved' : newStatus,
          timestamp: new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem('applicationStatusUpdates', JSON.stringify(updates));
        
        console.log('Stored application status update:', applicationId, newStatus);
      } catch (e) {
        console.error('Error storing application status update:', e);
      }
    },
    
    // Get status for an application (returns null if no update available)
    getStoredStatus(applicationId) {
      try {
        const updates = localStorage.getItem('applicationStatusUpdates');
        if (!updates) return null;
        
        const parsed = JSON.parse(updates);
        return parsed[applicationId] || null;
      } catch (e) {
        console.error('Error retrieving application status:', e);
        return null;
      }
    },
    
    // Get all status updates
    getAllStoredUpdates() {
      try {
        const updates = localStorage.getItem('applicationStatusUpdates');
        return updates ? JSON.parse(updates) : {};
      } catch (e) {
        console.error('Error retrieving application status updates:', e);
        return {};
      }
    },
    
    // Clear all status updates (e.g., after successful sync with backend)
    clearStoredUpdates() {
      localStorage.removeItem('applicationStatusUpdates');
    }
  };