<template>
    <div class="all-applications-container">
      <h1 class="page-title">All Applications</h1>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label>Filter by status:</label>
          <div class="status-buttons">
            <button 
              @click="statusFilter = 'all'" 
              :class="['filter-btn', statusFilter === 'all' ? 'active' : '']"
            >
              All
            </button>
            <button 
              @click="statusFilter = 'Pending'" 
              :class="['filter-btn', statusFilter === 'Pending' ? 'active' : '']"
            >
              Pending
            </button>
            <button 
              @click="statusFilter = 'Hired'" 
              :class="['filter-btn', statusFilter === 'Hired' ? 'active' : '']"
            >
              Approved
            </button>
            <button 
              @click="statusFilter = 'Rejected'" 
              :class="['filter-btn', statusFilter === 'Rejected' ? 'active' : '']"
            >
              Rejected
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" class="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="jobTitle">Job Title</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <p>Loading applications...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchApplications" class="retry-btn">Try Again</button>
      </div>
      
      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <p v-if="statusFilter === 'all'">No applications found.</p>
        <p v-else>No {{ statusFilter === 'Hired' ? 'approved' : statusFilter.toLowerCase() }} applications found.</p>
        <router-link to="/employer-dashboard" class="back-link">Back to Dashboard</router-link>
      </div>
      
      <div v-else class="application-table-container">
        <table class="applications-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Applicant</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="application in filteredApplications" :key="application._id">
              <td>{{ application.job?.title || application.jobTitle || 'N/A' }}</td>
              <td>
                <div class="applicant-info">
                  <p class="applicant-name">
                    {{ getApplicantName(application) }}
                  </p>
                  <p class="applicant-email">
                    {{ getApplicantEmail(application) }}
                  </p>
                </div>
              </td>
              <td>{{ formatDate(application.appliedDate) }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(application.status)]">
                  {{ getStatusDisplay(application.status) }}
                </span>
              </td>
              <td>
                <div class="application-actions">
                  <router-link :to="`/application-details/${application._id}`" class="action-btn view">
                    View
                  </router-link>
                  <div v-if="application.status === 'Pending'" class="status-buttons">
                    <button @click="updateApplicationStatus(application._id, 'Hired')" class="action-btn approve">
                      Approve
                    </button>
                    <button @click="updateApplicationStatus(application._id, 'Rejected')" class="action-btn reject">
                      Reject
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="back-link-container">
        <router-link to="/employer-dashboard" class="back-link">Back to Dashboard</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'AllApplications',
    setup() {
      const applications = ref([]);
      const loading = ref(true);
      const error = ref(null);
      const statusFilter = ref('all');
      const sortBy = ref('newest');
      
      // Helper to get applicant name consistently
      const getApplicantName = (application) => {
        // First check if we have the fullName field directly
        if (application.applicant?.fullName) {
          return application.applicant.fullName;
        }
        
        // Then try to get from firstName and lastName
        if (application.applicant?.firstName && application.applicant?.lastName) {
          return `${application.applicant.firstName} ${application.applicant.lastName}`;
        }
        
        // Try the direct applicantName field
        if (application.applicantName) {
          return application.applicantName;
        }
        
        // Try to extract name from MongoDB IDs if we can find a way
        if (application.applicantId) {
          return `Applicant (ID: ${application.applicantId.substring(0, 6)}...)`;
        }
        
        // Return placeholders only if no real data available
        return "Unknown Applicant";
      };
      
      // Helper to get applicant email consistently
      const getApplicantEmail = (application) => {
        // Try direct applicant email
        if (application.applicant?.email) {
          return application.applicant.email;
        }
        
        // Try applicantEmail field
        if (application.applicantEmail) {
          return application.applicantEmail;
        }
        
        // Return placeholder only if no real data available
        return application.realEmail || "applicant@example.com";
      };
      
      // Get CSS class for status badges
      const getStatusClass = (status) => {
        switch (status) {
          case 'Pending': return 'pending';
          case 'Hired': return 'approved'; 
          case 'Rejected': return 'rejected';
          default: return 'pending';
        }
      };
      
      // Get display text for status
      const getStatusDisplay = (status) => {
        switch (status) {
          case 'Hired': return 'Approved';
          default: return status;
        }
      };
      
      // Format date for display
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
      };
      
      // Get applications from localStorage first to show most current data
      const getLocalApplications = () => {
        try {
          const stored = localStorage.getItem('applicationData');
          if (stored) {
            const data = JSON.parse(stored);
            // Convert object to array
            return Object.values(data);
          }
        } catch (e) {
          console.error('Error getting applications from localStorage:', e);
        }
        return [];
      };
      
      // Computed property for filtered applications
      const filteredApplications = computed(() => {
        // First filter by status
        let filtered = applications.value;
        
        if (statusFilter.value !== 'all') {
          filtered = applications.value.filter(app => app.status === statusFilter.value);
        }
        
        // Then sort
        return sortFiltered(filtered);
      });
      
      // Function to sort applications based on the current sort criteria
      const sortFiltered = (apps) => {
        switch (sortBy.value) {
          case 'newest':
            return [...apps].sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
          case 'oldest':
            return [...apps].sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
          case 'jobTitle':
            return [...apps].sort((a, b) => {
              const titleA = a.job?.title || a.jobTitle || '';
              const titleB = b.job?.title || b.jobTitle || '';
              return titleA.localeCompare(titleB);
            });
          default:
            return apps;
        }
      };
      
      // Fetch all applications with multiple sources
      const fetchApplications = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    console.log('Attempting to fetch applications...');
    
    // Make sure this matches your backend route structure
    // If your server expects /api/applications/employer-applications
    const response = await apiClient.get('/applications/employer-applications');
    
    console.log('API response received:', response.data);
    
    if (response.data && Array.isArray(response.data)) {
      applications.value = response.data;
      console.log('Applications loaded:', applications.value.length);
    } else {
      console.warn('API returned empty or invalid data');
      error.value = 'No applications found';
    }
    
  } catch (err) {
    console.error('Error fetching applications:', err);
    error.value = 'Failed to load applications. Please try again.';
  } finally {
    loading.value = false;
  }
};
      
      // Helper function to merge applications from API and localStorage
      const mergeApplications = (apiApps, localApps) => {
        // Create a map of application IDs to applications
        const appMap = {};
        
        // First add all API applications
        apiApps.forEach(app => {
          appMap[app._id] = app;
        });
        
        // Then override with any local applications with the same ID
        localApps.forEach(app => {
          if (app._id) {
            appMap[app._id] = {
              ...appMap[app._id] || {},  // Keep original data if exists
              ...app,                    // Override with local data
              // Ensure we keep the applicant info if available
              applicant: app.applicant || (appMap[app._id] ? appMap[app._id].applicant : null)
            };
          }
        });
        
        // Convert back to array
        return Object.values(appMap);
      };
      
      // Update application status in UI and localStorage
      const updateApplicationStatus = async (applicationId, newStatus) => {
        try {
          // Find application
          const application = applications.value.find(app => app._id === applicationId);
          if (!application) {
            alert('Could not find application.');
            return;
          }
          
          // Update status in UI
          application.status = newStatus;
          
          // Save to localStorage
          try {
            let stored = localStorage.getItem('applicationData') || '{}';
            stored = JSON.parse(stored);
            
            stored[applicationId] = {
              ...application,
              status: newStatus,
              lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('applicationData', JSON.stringify(stored));
          } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
          }
          
          // Try to update on server
          try {
            await apiClient.put(`/applications/${applicationId}/status`, {
              status: newStatus
            });
            
            const message = newStatus === 'Hired' ? 'Application approved successfully!' : 
                          newStatus === 'Rejected' ? 'Application rejected' : 
                          `Application status updated to ${newStatus}`;
                          
            alert(message);
          } catch (apiError) {
            console.error('Error updating status on server:', apiError);
            
            // Show message that updates are saved locally
            const actionMessage = newStatus === 'Hired' ? 'Application approved!' : 
                                newStatus === 'Rejected' ? 'Application rejected' : 
                                'Status updated';
            
            alert(`${actionMessage} (Note: Changes may not be saved to the server)`);
          }
        } catch (error) {
          console.error('Error in updateApplicationStatus:', error);
          alert('An unexpected error occurred. Please try again.');
        }
      };
      
      // Fetch applications when component is mounted
      onMounted(() => {
        fetchApplications();
      });
      
      return {
        applications,
        loading,
        error,
        statusFilter,
        sortBy,
        filteredApplications,
        getApplicantName,
        getApplicantEmail,
        formatDate,
        getStatusClass,
        getStatusDisplay,
        updateApplicationStatus,
        fetchApplications
      };
    }
  };
  </script>
  
  <style scoped>
  .all-applications-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .page-title {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 600;
  }
  
  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .filter-group label {
    font-weight: 500;
  }
  
  .status-buttons {
    display: flex;
    gap: 8px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
  }
  
  .filter-btn.active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
  
  .sort-select {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .application-table-container {
    overflow-x: auto;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .applications-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .applications-table th,
  .applications-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
  }
  
  .applications-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .applications-table tr:hover {
    background-color: #f9f9f9;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  .status-badge.pending {
    background-color: #FFC107;
    color: #333;
  }
  
  .status-badge.approved {
    background-color: #4CAF50;
    color: white;
  }
  
  .status-badge.rejected {
    background-color: #F44336;
    color: white;
  }
  
  .application-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.9em;
    cursor: pointer;
    border: none;
  }
  
  .action-btn.view {
    background-color: #2196F3;
    color: white;
  }
  
  .action-btn.approve {
    background-color: #4CAF50;
    color: white;
  }
  
  .action-btn.reject {
    background-color: #F44336;
    color: white;
  }
  
  .applicant-info {
    display: flex;
    flex-direction: column;
  }
  
  .applicant-name {
    font-weight: 500;
    margin: 0;
  }
  
  .applicant-email {
    color: #555;
    font-size: 0.9em;
    margin: 4px 0 0 0;
  }
  
  .empty-state,
  .error-state,
  .loading-indicator {
    text-align: center;
    padding: 48px 0;
    color: #555;
  }
  
  .retry-btn,
  .back-link {
    display: inline-block;
    padding: 8px 16px;
    background-color: #2196F3;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    border: none;
    cursor: pointer;
  }
  
  .back-link-container {
    margin-top: 20px;
    text-align: center;
  }
  </style>