<template>
    <div class="applications-container">
      <h1 class="page-title">Applications for "{{ jobTitle }}"</h1>
      
      <div class="back-link">
        <router-link to="/employer-dashboard">
          &larr; Back to Dashboard
        </router-link>
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <p>Loading applications...</p>
      </div>
      
      <div v-else-if="applications.length === 0" class="empty-state">
        <p>No applications have been received for this job yet.</p>
      </div>
      
      <div v-else class="applications-list">
        <div class="applications-header">
          <div class="filters">
            <button 
              @click="currentFilter = 'all'" 
              :class="['filter-btn', currentFilter === 'all' ? 'active' : '']"
            >
              All ({{ applications.length }})
            </button>
            <button 
              @click="currentFilter = 'new'" 
              :class="['filter-btn', currentFilter === 'new' ? 'active' : '']"
            >
              New ({{ getFilteredCount('new') }})
            </button>
            <button 
              @click="currentFilter = 'reviewed'" 
              :class="['filter-btn', currentFilter === 'reviewed' ? 'active' : '']"
            >
              Reviewed ({{ getFilteredCount('reviewed') }})
            </button>
          </div>
          
          <div class="sort-controls">
            <label for="sort-by">Sort by:</label>
            <select id="sort-by" v-model="sortBy">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div v-for="application in filteredApplications" :key="application._id" class="application-card">
          <div class="status-badge" :class="application.status">
            {{ formatStatus(application.status) }}
          </div>
          
          <div class="application-header">
            <h3>{{ application.applicant.name }}</h3>
            <span class="application-date">Applied: {{ formatDate(application.appliedDate) }}</span>
          </div>
          
          <div class="contact-info">
            <p><strong>Email:</strong> {{ application.applicant.email }}</p>
            <p v-if="application.applicant.phone"><strong>Phone:</strong> {{ application.applicant.phone }}</p>
          </div>
          
          <div class="application-details">
            <div class="detail-section">
              <h4>Cover Letter</h4>
              <p class="cover-letter">{{ application.coverLetter }}</p>
            </div>
            
            <div class="detail-section">
              <h4>Experience</h4>
              <p>{{ application.experience }} years</p>
            </div>
            
            <div v-if="application.skills && application.skills.length > 0" class="detail-section">
              <h4>Skills</h4>
              <div class="skills-list">
                <span v-for="(skill, index) in application.skills" :key="index" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>
            
            <div v-if="application.resumeUrl" class="detail-section">
              <h4>Resume</h4>
              <a :href="application.resumeUrl" target="_blank" class="resume-link">
                View Resume
              </a>
            </div>
          </div>
          
          <div class="application-actions">
            <button 
              v-if="application.status === 'new'" 
              @click="markAsReviewed(application._id)" 
              class="action-btn primary"
            >
              Mark as Reviewed
            </button>
            
            <button 
              @click="showContactModal(application)"
              class="action-btn"
            >
              Contact Applicant
            </button>
          </div>
        </div>
      </div>
      
      <!-- Contact Modal -->
      <div v-if="showModal" class="modal-backdrop">
        <div class="modal-content">
          <h3>Contact {{ selectedApplicant?.applicant?.name }}</h3>
          
          <div class="form-group">
            <label for="subject">Subject</label>
            <input type="text" id="subject" v-model="contactForm.subject" />
          </div>
          
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" v-model="contactForm.message" rows="5"></textarea>
          </div>
          
          <div class="modal-actions">
            <button @click="closeModal" class="cancel-btn">Cancel</button>
            <button @click="sendMessage" class="primary-btn">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'JobApplications',
    setup() {
      const route = useRoute();
      const router = useRouter();
      const jobId = route.params.id;
      const jobTitle = ref('This Job');
      const applications = ref([]);
      const loading = ref(true);
      const currentFilter = ref('all');
      const sortBy = ref('date-desc');
      
      // Modal state
      const showModal = ref(false);
      const selectedApplicant = ref(null);
      const contactForm = ref({
        subject: '',
        message: ''
      });
      
      // Fetch job details and applications
      const fetchJobApplications = async () => {
        try {
          loading.value = true;
          
          // First get the job details to display the job title
          const jobResponse = await apiClient.get(`/jobs/${jobId}`);
          jobTitle.value = jobResponse.data.title || 'This Job';
          
          // Then get all applications for this job - UPDATED ENDPOINT
          const applicationsResponse = await apiClient.get(`/applications/job/${jobId}`);
          applications.value = applicationsResponse.data || [];
          
          console.log(`Loaded ${applications.value.length} applications for job ${jobId}`);
          
          loading.value = false;
        } catch (error) {
          console.error('Error fetching job applications:', error);
          if (error.response) {
            console.error('Server response:', error.response.data);
          }
          loading.value = false;
        }
      };
      
      // Filter applications based on selected filter
      const filteredApplications = computed(() => {
        let filtered = [...applications.value];
        
        // Apply status filter
        if (currentFilter.value !== 'all') {
          filtered = filtered.filter(app => app.status === currentFilter.value);
        }
        
        // Apply sorting
        if (sortBy.value === 'date-desc') {
          filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
        } else if (sortBy.value === 'date-asc') {
          filtered.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
        }
        
        return filtered;
      });
      
      // Get count of applications by status for filter buttons
      const getFilteredCount = (status) => {
        return applications.value.filter(app => app.status === status).length;
      };
      
      // Format application status for display
      const formatStatus = (status) => {
        const statusMap = {
          'new': 'New',
          'reviewed': 'Reviewed',
          'shortlisted': 'Shortlisted',
          'rejected': 'Rejected',
          'hired': 'Hired'
        };
        return statusMap[status] || status;
      };
      
      // Format date for display
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
      };
      
      // Mark an application as reviewed
      const markAsReviewed = async (applicationId) => {
        try {
          const response = await apiClient.put(`/applications/${applicationId}`, {
            status: 'reviewed'
          });
          
          if (response.status === 200) {
            // Update the application in our local array
            const index = applications.value.findIndex(app => app._id === applicationId);
            if (index !== -1) {
              applications.value[index].status = 'reviewed';
            }
          }
        } catch (error) {
          console.error('Error updating application status:', error);
          alert('Failed to update application status. Please try again.');
        }
      };
      
      // Show contact modal for an application
      const showContactModal = (application) => {
        selectedApplicant.value = application;
        contactForm.value.subject = `Regarding your application for ${jobTitle.value}`;
        contactForm.value.message = '';
        showModal.value = true;
      };
      
      // Close the contact modal
      const closeModal = () => {
        showModal.value = false;
        selectedApplicant.value = null;
      };
      
      // Send a message to the applicant
      const sendMessage = async () => {
        if (!selectedApplicant.value) return;
        
        try {
          const response = await apiClient.post('/messages/send', {
            recipientId: selectedApplicant.value.applicant._id,
            jobId: jobId,
            subject: contactForm.value.subject,
            message: contactForm.value.message
          });
          
          if (response.status === 200) {
            alert('Message sent successfully!');
            closeModal();
          }
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        }
      };
      
      // Fetch data when component is mounted
      onMounted(() => {
        fetchJobApplications();
      });
      
      return {
        jobTitle,
        applications,
        loading,
        currentFilter,
        sortBy,
        filteredApplications,
        showModal,
        selectedApplicant,
        contactForm,
        getFilteredCount,
        formatStatus,
        formatDate,
        markAsReviewed,
        showContactModal,
        closeModal,
        sendMessage
      };
    }
  };
  </script>
  
  <style scoped>
  .applications-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  .back-link {
    margin-bottom: 30px;
  }
  
  .back-link a {
    color: #4299e1;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    font-weight: 500;
  }
  
  .back-link a:hover {
    text-decoration: underline;
  }
  
  /* Applications List Header */
  .applications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .filters {
    display: flex;
    gap: 10px;
  }
  
  .filter-btn {
    background: none;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    color: #6c757d;
  }
  
  .filter-btn.active {
    background-color: #e9ecef;
    color: #4299e1;
    font-weight: 500;
  }
  
  .sort-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .sort-controls label {
    color: #6c757d;
    font-size: 14px;
  }
  
  .sort-controls select {
    padding: 6px 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    color: #495057;
  }
  
  /* Application Cards */
  .applications-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .application-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  
  .status-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge.new {
    background-color: #e3f2fd;
    color: #0d47a1;
  }
  
  .status-badge.reviewed {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .status-badge.shortlisted {
    background-color: #fff8e1;
    color: #f57f17;
  }
  
  .status-badge.rejected {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .status-badge.hired {
    background-color: #e0f7fa;
    color: #00796b;
  }
  
  .application-header {
    margin-bottom: 15px;
    padding-right: 80px; /* Make space for the status badge */
  }
  
  .application-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 5px 0;
  }
  
  .application-date {
    font-size: 14px;
    color: #6c757d;
  }
  
  .contact-info {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    font-size: 14px;
  }
  
  .contact-info p {
    margin: 0;
  }
  
  .application-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .detail-section h4 {
    font-size: 15px;
    font-weight: 600;
    color: #495057;
    margin: 0 0 5px 0;
  }
  
  .cover-letter {
    font-size: 14px;
    color: #495057;
    line-height: 1.5;
    white-space: pre-line;
  }
  
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .skill-tag {
    background-color: #f1f3f5;
    color: #495057;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 13px;
  }
  
  .resume-link {
    display: inline-flex;
    align-items: center;
    color: #4299e1;
    font-size: 14px;
    text-decoration: none;
  }
  
  .resume-link:hover {
    text-decoration: underline;
  }
  
  .application-actions {
    display: flex;
    gap: 15px;
    border-top: 1px solid #eee;
    padding-top: 15px;
  }
  
  .action-btn {
    padding: 8px 15px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ced4da;
    background-color: #f8f9fa;
    color: #495057;
  }
  
  .action-btn.primary {
    background-color: #4299e1;
    color: white;
    border: none;
  }
  
  .action-btn.primary:hover {
    background-color: #007ce2;
  }
  
  .action-btn:not(.primary):hover {
    background-color: #e9ecef;
  }
  
  /* Loading & Empty State */
  .loading-indicator, .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #6c757d;
  }
  
  /* Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 25px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-content h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #2c3e50;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #495057;
  }
  
  .form-group input, .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    color: #212529;
  }
  
  .form-group textarea {
    resize: vertical;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 20px;
  }
  
  .cancel-btn {
    padding: 8px 15px;
    background-color: #f1f3f5;
    color: #495057;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .primary-btn {
    padding: 8px 15px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .applications-header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
    
    .contact-info {
      flex-direction: column;
      gap: 5px;
    }
    
    .application-actions {
      flex-direction: column;
    }
    
    .action-btn {
      width: 100%;
    }
  }
  </style>