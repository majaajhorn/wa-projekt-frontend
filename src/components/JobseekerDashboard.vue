<template>
  <div v-if="showChangePasswordForm">
    <ChangePassword @password-changed="handlePasswordChanged" />
  </div>

  <div class="dashboard-container">
    <h1 class="dashboard-title">Jobseeker Dashboard</h1>
    
    <div class="dashboard-stats">
      <div class="stat-card" @click="scrollToApplications" style="cursor: pointer;">
        <h3>Applied Jobs</h3>
        <p class="stat-number">{{ applicationCount }}</p>
      </div>
      <div class="stat-card" @click="scrollToSavedJobs" style="cursor: pointer;">
        <h3>Saved Jobs</h3>
        <p class="stat-number">{{ savedJobsCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Profile Views</h3>
        <p class="stat-number">{{ profileViews }}</p>
      </div>
    </div>
    
    <div class="dashboard-actions">
      <router-link to="/job-search" class="action-btn primary">
        <span class="action-icon">🔍</span>
        <span>Find Jobs</span>
      </router-link>
      
      <router-link to="/my-profile" class="action-btn">
        <span>Update My Profile</span>
      </router-link>
    </div>
    
    <div class="my-applications-section" ref="applicationsSection">
      <div class="section-header">
        <h2>My Applications</h2>
        <div class="filter-controls">
          <button 
            @click="applicationFilter = 'all'" 
            :class="['filter-btn', applicationFilter === 'all' ? 'active' : '']"
          >
            All
          </button>
          <button 
            @click="applicationFilter = 'pending'" 
            :class="['filter-btn', applicationFilter === 'pending' ? 'active' : '']"
          >
            Pending
          </button>
          <button 
            @click="applicationFilter = 'reviewed'" 
            :class="['filter-btn', applicationFilter === 'reviewed' ? 'active' : '']"
          >
            Reviewed
          </button>
        </div>
      </div>
      
      <div v-if="loadingApplications" class="loading-indicator">
        <p>Loading your applications...</p>
      </div>
      
      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <p v-if="applicationFilter === 'all'">You haven't applied to any jobs yet.</p>
        <p v-else>No {{ applicationFilter }} applications found.</p>
        <router-link to="/job-search" class="primary-btn">Browse Jobs</router-link>
      </div>
      
      <div v-else class="application-listings">
        <div 
          v-for="application in filteredApplications" 
          :key="application._id" 
          class="application-card" 
          @click="viewJobDetails(application.job._id)"
        >
          <div class="application-status" :class="application.status.toLowerCase()">
            {{ application.status }}
          </div>
          <h3 class="job-title">{{ application.job.title }}</h3>
          <div class="job-details">
            <p class="job-company">🏢 {{ application.job.company }}</p>
            <p class="job-location">📍 {{ application.job.location }}</p>
            <p class="job-salary">💰 £{{ application.job.salary }} {{ formatSalaryPeriod(application.job.salaryPeriod) }}</p>
          </div>
          <div class="job-stats">
            <span class="stat-item">
              <span class="stat-label">Applied:</span>
              {{ formatDate(application.appliedDate) }}
            </span>
            <span class="stat-item">
              <span class="stat-label">Last Update:</span>
              {{ formatDate(application.lastStatusUpdate || application.appliedDate) }}
            </span>
          </div>
          <div class="application-actions" @click.stop>
            <router-link :to="`/job-details/${application.job._id}`" class="action-link">
              View Job
            </router-link>
            <button class="action-link" @click="viewApplicationDetails(application._id)">
              View Details
            </button>
            <button v-if="application.status === 'Pending'" class="action-link danger" @click="confirmWithdrawApplication(application)">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="saved-jobs-section" ref="savedJobsSection">
      <div class="section-header">
        <h2>Saved Jobs</h2>
      </div>
      
      <div v-if="loadingSavedJobs" class="loading-indicator">
        <p>Loading saved jobs...</p>
      </div>
      
      <div v-else-if="savedJobs.length === 0" class="empty-state">
        <p>You haven't saved any jobs yet.</p>
        <router-link to="/job-search" class="primary-btn">Find Jobs</router-link>
      </div>
      
      <div v-else class="saved-jobs-listings">
        <div 
          v-for="job in savedJobs" 
          :key="job._id" 
          class="job-card" 
          @click="viewJobDetails(job._id)"
        >
          <h3 class="job-title">{{ job.title }}</h3>
          <div class="job-details">
            <p class="job-company">🏢 {{ job.company }}</p>
            <p class="job-location">📍 {{ job.location }}</p>
            <p class="job-salary">💰 £{{ job.salary }} {{ formatSalaryPeriod(job.salaryPeriod) }}</p>
            <p class="job-type">🕒 {{ formatEmploymentType(job.employmentType) }}</p>
          </div>
          <div class="job-stats">
            <span class="stat-item">
              <span class="stat-label">Posted:</span>
              {{ formatDate(job.postedDate) }}
            </span>
            <span class="stat-item">
              <span class="stat-label">Saved:</span>
              {{ formatDate(job.savedDate) }}
            </span>
          </div>
          <div class="job-actions" @click.stop>
            <router-link :to="`/job-details/${job._id}`" class="action-link">
              View Details
            </router-link>
            <button class="action-link danger" @click="confirmRemoveSavedJob(job)">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Application Withdraw Confirmation Modal -->
    <div v-if="showWithdrawModal" class="modal-backdrop">
      <div class="modal-content">
        <h3>Confirm Withdrawal</h3>
        <p>Are you sure you want to withdraw your application for "<strong>{{ applicationToWithdraw?.job.title }}</strong>"?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showWithdrawModal = false" class="cancel-btn">Cancel</button>
          <button @click="withdrawApplication" class="danger-btn">Withdraw Application</button>
        </div>
      </div>
    </div>
    
    <!-- Remove Saved Job Confirmation Modal -->
    <div v-if="showRemoveModal" class="modal-backdrop">
      <div class="modal-content">
        <h3>Confirm Removal</h3>
        <p>Are you sure you want to remove "<strong>{{ jobToRemove?.title }}</strong>" from your saved jobs?</p>
        <div class="modal-actions">
          <button @click="showRemoveModal = false" class="cancel-btn">Cancel</button>
          <button @click="removeSavedJob" class="danger-btn">Remove Job</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/axios.js';
import ChangePassword from './ChangePassword.vue'; // Import the component

export default {
  name: 'JobseekerDashboard',
  components: {
    ChangePassword
  },
  setup() {
    const router = useRouter();
    
    // Application states
    const applications = ref([]);
    const loadingApplications = ref(true);
    const applicationFilter = ref('all');
    const applicationCount = ref(0);
    const showWithdrawModal = ref(false);
    const applicationToWithdraw = ref(null);
    const savedJobsSection = ref(null);
    const applicationsSection = ref(null);
    
    // Saved jobs states
    const savedJobs = ref([]);
    const loadingSavedJobs = ref(true);
    const savedJobsCount = ref(0);
    const showRemoveModal = ref(false);
    const jobToRemove = ref(null);

    // Password change
    const showChangePasswordForm = ref(false);
    
    // Profile stats
    const profileViews = ref(0);
    
    // Filter applications based on status
    const filteredApplications = computed(() => {
      if (applicationFilter.value === 'all') {
        return applications.value;
      } else if (applicationFilter.value === 'pending') {
        return applications.value.filter(app => app.status === 'Pending');
      } else if (applicationFilter.value === 'reviewed') {
        return applications.value.filter(app => app.status === 'Reviewed' || app.status === 'Interviewing');
      } else {
        return applications.value;
      }
    });
    
    // Fetch user's job applications
    const fetchApplications = async () => {
      try {
        loadingApplications.value = true;
        
        const response = await apiClient.get('/applications/my-applications');
        
        // Make sure we have valid data structure
        if (Array.isArray(response.data)) {
          applications.value = response.data.filter(app => {
            // Check that we have both application and job data
            if (!app.job) {
              console.error('Application missing job data:', app);
              return false;
            }
            return true;
          });
          
          applicationCount.value = applications.value.length;
          console.log(`Loaded ${applicationCount.value} applications with data:`, applications.value);
        } else {
          console.error('Unexpected response data format:', response.data);
          applications.value = [];
          applicationCount.value = 0;
        }
        
        loadingApplications.value = false;
      } catch (error) {
        console.error('Error fetching applications:', error);
        
        // Check if there's a specific error response
        if (error.response) {
          console.error('Server response error:', error.response.data);
        }
        
        applications.value = [];
        applicationCount.value = 0;
        loadingApplications.value = false;
      }
    };
    
    // Fetch user's saved jobs
    const fetchSavedJobs = async () => {
      try {
        loadingSavedJobs.value = true;
        const response = await apiClient.get('/jobs/saved-jobs');
        savedJobs.value = response.data;
        savedJobsCount.value = savedJobs.value.length;
        loadingSavedJobs.value = false;
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
        loadingSavedJobs.value = false;
      }
    };
    
    // Fetch profile stats
    const fetchProfileStats = async () => {
      try {
        const response = await apiClient.get('/users/profile-stats');
        profileViews.value = response.data.viewCount || 0;
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        // Use default value if error - Don't let this error break the rest of the page
        profileViews.value = 0;
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
    
    // Format employment type for display
    const formatEmploymentType = (type) => {
      const types = {
        'full_time': 'Full Time',
        'part_time': 'Part Time',
        'contract': 'Contract',
        'temporary': 'Temporary'
      };
      return types[type] || type;
    };
    
    // Format salary period for display
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
    
    // Navigate to job details
    const viewJobDetails = (jobId) => {
      router.push(`/job-details/${jobId}`);
    };
    
    // View application details
    const viewApplicationDetails = (applicationId) => {
      router.push(`/application-details/${applicationId}`);
    };
    
    // Apply for a job
    const applyForJob = (jobId) => {
      router.push(`/apply-job/${jobId}`);
    };
    
    // Show withdraw confirmation modal
    const confirmWithdrawApplication = (application) => {
      applicationToWithdraw.value = application;
      showWithdrawModal.value = true;
    };
    
    // Withdraw application after confirmation
    const withdrawApplication = async () => {
      if (!applicationToWithdraw.value) return;
      
      try {
        const response = await apiClient.delete(`/applications/${applicationToWithdraw.value._id}`);
        
        if (response.status === 200) {
          // Remove application from the local array
          applications.value = applications.value.filter(
            app => app._id !== applicationToWithdraw.value._id
          );
          
          // Update application count
          applicationCount.value = applications.value.length;
          
          // Close modal
          showWithdrawModal.value = false;
          applicationToWithdraw.value = null;
        }
      } catch (error) {
        console.error('Error withdrawing application:', error);
        alert('Failed to withdraw application. Please try again.');
      }
    };
    
    // Show remove saved job confirmation modal
    const confirmRemoveSavedJob = (job) => {
      jobToRemove.value = job;
      showRemoveModal.value = true;
    };
    
    // Remove saved job after confirmation
    const removeSavedJob = async () => {
      if (!jobToRemove.value) return;
      
      try {
        const response = await apiClient.delete(`/jobs/saved/${jobToRemove.value._id}`);
        
        if (response.status === 200) {
          // Remove job from the local array
          savedJobs.value = savedJobs.value.filter(job => job._id !== jobToRemove.value._id);
          
          // Update saved jobs count
          savedJobsCount.value = savedJobs.value.length;
          
          // Close modal
          showRemoveModal.value = false;
          jobToRemove.value = null;
        }
      } catch (error) {
        console.error('Error removing saved job:', error);
        alert('Failed to remove saved job. Please try again.');
      }
    };

    const scrollToSavedJobs = () => {
      if (savedJobsSection.value) {
        savedJobsSection.value.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    const scrollToApplications = () => {
      if (applicationsSection.value) {
        applicationsSection.value.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    const handlePasswordChanged = () => {
      showChangePasswordForm.value = false;
    };
    
    // Fetch data when component is mounted
    onMounted(() => {
      fetchApplications();
      fetchSavedJobs();
      fetchProfileStats();

      // Check if user has a temporary password
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.passwordTemporary) {
        showChangePasswordForm.value = true;
      }
    });
    
    return {
      // Applications
      applications,
      loadingApplications,
      applicationFilter,
      filteredApplications,
      applicationCount,
      showWithdrawModal,
      applicationToWithdraw,
      applicationsSection,
      
      // Saved Jobs
      savedJobs,
      loadingSavedJobs,
      savedJobsCount,
      showRemoveModal,
      jobToRemove,
      savedJobsSection,
      
      // Profile
      profileViews,
      
      // Password change
      showChangePasswordForm,
      handlePasswordChanged,
      
      // Functions
      formatDate,
      formatEmploymentType,
      formatSalaryPeriod,
      viewJobDetails,
      viewApplicationDetails,
      applyForJob,
      confirmWithdrawApplication,
      withdrawApplication,
      confirmRemoveSavedJob,
      removeSavedJob,
      scrollToSavedJobs,
      scrollToApplications,
    };
  }
};
</script>
  
<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
}

/* Stats Cards */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #4CAF50;
  margin: 0;
}

/* Action Buttons */
.dashboard-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #4CAF50;
  color: white;
}

.action-btn.primary:hover {
  background-color: #45a049;
}

.action-btn:not(.primary) {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn:not(.primary):hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

.action-icon {
  font-size: 18px;
  font-weight: bold;
}

/* Section Styling */
.my-applications-section, .saved-jobs-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-btn {
  background: none;
  border: none;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  color: #6c757d;
}

.filter-btn.active {
  background-color: #e9ecef;
  color: #4CAF50;
  font-weight: 500;
}

/* Application and Job Cards */
.application-listings, .saved-jobs-listings {
  display: grid;
  gap: 15px;
}

.application-card, .job-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.application-card:hover, .job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.application-status {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.application-status.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.application-status.reviewed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.application-status.interviewing {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.application-status.rejected {
  background-color: #ffebee;
  color: #c62828;
}

.job-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
  padding-right: 80px; /* Make space for the status badge */
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.job-details p {
  margin: 0;
  font-size: 14px;
  color: #495057;
}

.job-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #6c757d;
}

.stat-label {
  font-weight: 500;
  margin-right: 5px;
}

.application-actions, .job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.action-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: #4CAF50;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: none;
}

.action-link:hover {
  color: #45a049;
  text-decoration: underline;
}

.action-link.danger {
  color: #e53935;
}

.action-link.danger:hover {
  color: #c62828;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-state p {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 20px;
}

.primary-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.primary-btn:hover {
  background-color: #45a049;
}

/* Loading Indicator */
.loading-indicator {
  text-align: center;
  padding: 30px 0;
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
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.warning-text {
  color: #e53935;
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
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .dashboard-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .job-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .job-stats {
    flex-direction: column;
    gap: 5px;
  }
}
</style>