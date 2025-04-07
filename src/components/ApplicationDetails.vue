<template>
    <div class="application-details-container">
      <h1 class="page-title">Application Details</h1>
      
      <div v-if="loading" class="loading-indicator">
        <p>Loading application details...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="goBack" class="back-btn">Go Back</button>
      </div>
      
      <div v-else class="application-content">
        <!-- Application Status -->
        <div class="status-section">
          <div class="status-badge" :class="application.status.toLowerCase()">
            {{ application.status }}
          </div>
          <p class="status-date">
            Applied on {{ formatDate(application.appliedDate) }}
          </p>
        </div>
        
        <!-- Job Information -->
        <div class="job-section">
          <h2 class="section-title">Job Details</h2>
          <div class="job-card">
            <h3 class="job-title">{{ application.job.title }}</h3>
            <div class="job-company">{{ application.job.company }}</div>
            <div class="job-info-grid">
              <div class="info-item">
                <span class="info-label">Location:</span>
                <span class="info-value">{{ application.job.location }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Salary:</span>
                <span class="info-value">£{{ application.job.salary }} {{ formatSalaryPeriod(application.job.salaryPeriod) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employment Type:</span>
                <span class="info-value">{{ formatEmploymentType(application.job.employmentType) }}</span>
              </div>
            </div>
            <div class="job-actions">
              <button @click="viewJobDetails" class="action-btn">View Full Job Posting</button>
            </div>
          </div>
        </div>
        
        <!-- Application Details -->
        <div class="application-section">
          <h2 class="section-title">Your Application</h2>
          <div class="application-card">
            <div class="application-field">
              <h4 class="field-label">Cover Letter</h4>
              <div class="field-content cover-letter">
                {{ application.coverLetter }}
              </div>
            </div>
            
            <div class="application-field">
              <h4 class="field-label">Additional Notes</h4>
              <div class="field-content">
                {{ application.additionalNotes || 'No additional notes provided.' }}
              </div>
            </div>
            
            <div v-if="application.resume" class="application-field">
              <h4 class="field-label">Resume</h4>
              <div class="field-content">
                <a :href="application.resume" target="_blank" class="resume-link">View Resume</a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Application Timeline -->
        <div class="timeline-section">
          <h2 class="section-title">Application Timeline</h2>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-point active"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(application.appliedDate) }}</div>
                <div class="timeline-title">Application Submitted</div>
                <div class="timeline-description">Your application was successfully submitted.</div>
              </div>
            </div>
            
            <div class="timeline-item" :class="{'active': application.reviewedDate}">
              <div class="timeline-point" :class="{'active': application.reviewedDate}"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ application.reviewedDate ? formatDate(application.reviewedDate) : 'Pending' }}</div>
                <div class="timeline-title">Application Reviewed</div>
                <div class="timeline-description">
                  {{ application.reviewedDate ? 'Your application has been reviewed by the employer.' : 'Waiting for the employer to review your application.' }}
                </div>
              </div>
            </div>
            
            <div class="timeline-item" :class="{'active': application.interviewDate}">
              <div class="timeline-point" :class="{'active': application.interviewDate}"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ application.interviewDate ? formatDate(application.interviewDate) : 'Pending' }}</div>
                <div class="timeline-title">Interview</div>
                <div class="timeline-description">
                  {{ application.interviewDate ? 'Interview scheduled or completed.' : 'Waiting for interview scheduling.' }}
                </div>
              </div>
            </div>
            
            <div class="timeline-item" :class="{'active': application.decisionDate}">
              <div class="timeline-point" :class="{'active': application.decisionDate}"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ application.decisionDate ? formatDate(application.decisionDate) : 'Pending' }}</div>
                <div class="timeline-title">Final Decision</div>
                <div class="timeline-description">
                  {{ application.decisionDate ? `Decision: ${application.decision || 'Made'}` : 'Awaiting final decision.' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="actions-section">
          <button @click="goBack" class="back-btn">Back to Dashboard</button>
          
          <button 
            v-if="application.status === 'Pending'" 
            @click="confirmWithdraw" 
            class="withdraw-btn"
          >
            Withdraw Application
          </button>
        </div>
        
        <!-- Confirmation Modal -->
        <div v-if="showWithdrawModal" class="modal-backdrop">
          <div class="modal-content">
            <h3>Confirm Withdrawal</h3>
            <p>Are you sure you want to withdraw your application for "<strong>{{ application.job.title }}</strong>"?</p>
            <p class="warning-text">This action cannot be undone.</p>
            <div class="modal-actions">
              <button @click="cancelWithdraw" class="cancel-btn">Cancel</button>
              <button @click="withdrawApplication" class="danger-btn">Withdraw Application</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'ApplicationDetails',
    setup() {
      const router = useRouter();
      const route = useRoute();
      
      const applicationId = route.params.id;
      const application = ref({});
      const loading = ref(true);
      const error = ref(null);
      const showWithdrawModal = ref(false);
      
      // Fetch application details
      const fetchApplicationDetails = async () => {
        try {
          loading.value = true;
          error.value = null;
          
          const response = await apiClient.get(`/applications/${applicationId}`);
          application.value = response.data;
          
          loading.value = false;
        } catch (err) {
          console.error('Error fetching application details:', err);
          error.value = 'Failed to load application details. Please try again later.';
          loading.value = false;
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
      
      // Format salary period
      const formatSalaryPeriod = (period) => {
        const periods = {
          'hourly': 'per hour',
          'daily': 'per day',
          'weekly': 'per week',
          'monthly': 'per month',
          'yearly': 'per year'
        };
        return periods[period] || period;
      };
      
      // Format employment type
      const formatEmploymentType = (type) => {
        const types = {
          'full_time': 'Full Time',
          'part_time': 'Part Time',
          'contract': 'Contract',
          'temporary': 'Temporary'
        };
        return types[type] || type;
      };
      
      // View full job details
      const viewJobDetails = () => {
        router.push(`/job-details/${application.value.job._id}`);
      };
      
      // Go back to dashboard
      const goBack = () => {
        // Get user role from localStorage
        const userRole = localStorage.getItem('userRole') || '';
        
        // Redirect to the appropriate dashboard based on role
        if (userRole === 'employer') {
          router.push('/employer-dashboard');
        } else {
          router.push('/jobseeker-dashboard');
        }
      };
      
      // Show withdraw confirmation modal
      const confirmWithdraw = () => {
        showWithdrawModal.value = true;
      };
      
      // Cancel withdraw action
      const cancelWithdraw = () => {
        showWithdrawModal.value = false;
      };
      
      // Withdraw application
      const withdrawApplication = async () => {
        try {
          const response = await apiClient.delete(`/applications/${applicationId}`);
          
          if (response.status === 200) {
            // Redirect to dashboard with success message
            router.push({ 
              path: '/jobseeker-dashboard',
              query: { 
                message: 'Application withdrawn successfully' 
              }
            });
          }
        } catch (err) {
          console.error('Error withdrawing application:', err);
          error.value = 'Failed to withdraw application. Please try again later.';
          showWithdrawModal.value = false;
        }
      };
      
      // Fetch application data on mount
      onMounted(() => {
        fetchApplicationDetails();
      });
      
      return {
        application,
        loading,
        error,
        showWithdrawModal,
        formatDate,
        formatSalaryPeriod,
        formatEmploymentType,
        viewJobDetails,
        goBack,
        confirmWithdraw,
        cancelWithdraw,
        withdrawApplication
      };
    }
  };
  </script>
  
  <style scoped>
  .application-details-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 30px;
    color: #2c3e50;
    text-align: center;
  }
  
  /* Loading and Error States */
  .loading-indicator, .error-message {
    text-align: center;
    padding: 40px 0;
    color: #6c757d;
  }
  
  .error-message {
    color: #dc3545;
  }
  
  /* Status Section */
  .status-section {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    gap: 15px;
  }
  
  .status-badge {
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .status-badge.pending {
    background-color: #fff3e0;
    color: #e65100;
  }
  
  .status-badge.reviewed {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .status-badge.interviewing {
    background-color: #e3f2fd;
    color: #0d47a1;
  }
  
  .status-badge.rejected {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .status-badge.accepted {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .status-date {
    color: #6c757d;
    font-size: 14px;
    margin: 0;
  }
  
  /* Section Styling */
  .job-section, .application-section, .timeline-section {
    margin-bottom: 30px;
  }
  
  .section-title {
    font-size: 20px;
    color: #2c3e50;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }
  
  /* Job Card */
  .job-card, .application-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .job-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .job-company {
    font-size: 16px;
    color: #495057;
    margin-bottom: 15px;
  }
  
  .job-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
  }
  
  .info-label {
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .info-value {
    font-weight: 500;
    color: #2c3e50;
  }
  
  /* Application Card */
  .application-field {
    margin-bottom: 20px;
  }
  
  .field-label {
    font-size: 16px;
    color: #495057;
    margin-bottom: 8px;
  }
  
  .field-content {
    color: #2c3e50;
    line-height: 1.5;
  }
  
  .field-content.cover-letter {
    white-space: pre-line;
  }
  
  .resume-link {
    color: #4CAF50;
    text-decoration: none;
  }
  
  .resume-link:hover {
    text-decoration: underline;
  }
  
  /* Timeline */
  .timeline {
    position: relative;
    padding-left: 30px;
  }
  
  .timeline:before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #e9ecef;
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: 25px;
    opacity: 0.7;
  }
  
  .timeline-item.active {
    opacity: 1;
  }
  
  .timeline-point {
    position: absolute;
    left: -30px;
    width: 20px;
    height: 20px;
    background-color: #f8f9fa;
    border: 2px solid #ced4da;
    border-radius: 50%;
  }
  
  .timeline-point.active {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
  
  .timeline-content {
    padding-bottom: 10px;
  }
  
  .timeline-date {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 5px;
  }
  
  .timeline-title {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 5px;
  }
  
  .timeline-description {
    font-size: 14px;
    color: #495057;
  }
  
  /* Action Buttons */
  .actions-section {
    display: flex;
    gap: 15px;
    margin-top: 30px;
  }
  
  .back-btn, .action-btn {
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    text-decoration: none;
    text-align: center;
  }
  
  .back-btn {
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ced4da;
  }
  
  .back-btn:hover {
    background-color: #e9ecef;
  }
  
  .action-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .action-btn:hover {
    background-color: #45a049;
  }
  
  .withdraw-btn {
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    background-color: #f8d7da;
    color: #dc3545;
    margin-left: auto;
  }
  
  .withdraw-btn:hover {
    background-color: #f5c2c7;
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
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-content h3 {
    margin-top: 0;
    color: #2c3e50;
  }
  
  .warning-text {
    color: #dc3545;
    font-size: 14px;
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
  
  .danger-btn {
    padding: 8px 15px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .job-info-grid {
      grid-template-columns: 1fr;
    }
    
    .actions-section {
      flex-direction: column;
    }
    
    .withdraw-btn {
      margin-left: 0;
    }
  }
  </style>