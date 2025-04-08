<template>
  <div class="job-details-container">
    <h1 class="page-title">Job Details</h1>
    
    <div class="back-link">
      <router-link :to="userRole === 'employer' ? '/employer-dashboard' : '/jobseeker-dashboard'">
        &larr; Back to Dashboard
      </router-link>
    </div>
    
    <div v-if="loading" class="loading-indicator">
      <p>Loading job details...</p>
    </div>
    
    <div v-else-if="!job" class="error-state">
      <p>Job not found or could not be loaded.</p>
      <router-link :to="userRole === 'employer' ? '/employer-dashboard' : '/jobseeker-dashboard'" class="btn-primary">Return to Dashboard</router-link>
    </div>
    
    <div v-else class="job-details-card">
      <div class="job-header">
        <h2 class="job-title">{{ job.title }}</h2>
        <div v-if="userRole === 'employer'" class="job-status" :class="job.active ? 'active' : 'inactive'">
          {{ job.active ? 'Active' : 'Inactive' }}
        </div>
      </div>
      
      <div class="job-meta">
        <div class="meta-item">
          <span class="meta-icon">📍</span>
          <span class="meta-text">{{ job.location }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">💰</span>
          <span class="meta-text">£{{ job.salary }} {{ formatSalaryPeriod(job.salaryPeriod) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🕒</span>
          <span class="meta-text">{{ formatEmploymentType(job.employmentType) }}</span>
        </div>
      </div>
      
      <div class="job-stats">
        <div class="stat-item">
          <span class="stat-label">Posted:</span>
          <span class="stat-value">{{ formatDate(job.postedDate) }}</span>
        </div>
        <div v-if="userRole === 'employer'" class="stat-item">
          <span class="stat-label">Applications:</span>
          <span class="stat-value">{{ job.applications ? job.applications.length : 0 }}</span>
        </div>
        <div v-if="job.applicationDeadline" class="stat-item">
          <span class="stat-label">Deadline:</span>
          <span class="stat-value">{{ formatDate(job.applicationDeadline) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Positions:</span>
          <span class="stat-value">{{ job.positions || 1 }}</span>
        </div>
      </div>
      
      <div class="job-section">
        <h3 class="section-title">Description</h3>
        <div class="section-content">
          <p v-if="job.description" class="job-description">{{ job.description }}</p>
          <p v-else class="empty-content">No description provided.</p>
        </div>
      </div>
      
      <div class="job-section">
        <h3 class="section-title">Requirements</h3>
        <div class="section-content">
          <ul v-if="formattedRequirements.length > 0" class="requirements-list">
            <li v-for="(requirement, index) in formattedRequirements" :key="index">
              {{ requirement }}
            </li>
          </ul>
          <p v-else class="empty-content">No specific requirements provided.</p>
        </div>
      </div>
      
      <div class="job-section">
        <h3 class="section-title">Benefits</h3>
        <div class="section-content">
          <p v-if="job.benefits" class="job-benefits">{{ job.benefits }}</p>
          <p v-else class="empty-content">No benefits details provided.</p>
        </div>
      </div>
      
      <!-- Different actions based on user role -->
      <div v-if="userRole === 'employer'" class="job-actions">
        <router-link :to="`/job-applications/${job._id}`" class="action-btn">
          View Applications ({{ job.applications ? job.applications.length : 0 }})
        </router-link>
        <router-link :to="`/edit-job/${job._id}`" class="action-btn">
          Edit Job
        </router-link>
        <button @click="toggleJobStatus" class="action-btn" :class="job.active ? 'deactivate' : 'activate'">
          {{ job.active ? 'Deactivate' : 'Activate' }} Job
        </button>
        <button @click="confirmDeleteJob" class="action-btn delete">
          Delete Job
        </button>
      </div>
      
      <!-- Jobseeker actions -->
      <div v-else class="job-actions">
        <router-link :to="`/apply-job/${job._id}`" class="action-btn primary" v-if="!hasApplied">
          Apply Now
        </router-link>
        <button class="action-btn" v-else disabled>
          Already Applied
        </button>
        <button @click="toggleSavedJob" class="action-btn" :class="isSaved ? 'remove-saved' : 'save-job'">
          {{ isSaved ? 'Remove from Saved Jobs' : 'Save Job' }}
        </button>
      </div>
      
      <!-- Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-backdrop">
        <div class="modal-content">
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete the job "<strong>{{ job?.title }}</strong>"?</p>
          <p class="warning-text">This action cannot be undone.</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
            <button @click="deleteJob" class="danger-btn">Delete Job</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../api/axios.js';

export default {
  name: 'JobDetails',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const jobId = route.params.id;
    const job = ref(null);
    const loading = ref(true);
    const showDeleteModal = ref(false);
    const userRole = ref('');
    const hasApplied = ref(false);
    const isSaved = ref(false);
    
    const formattedRequirements = computed(() => {
      if (!job.value || !job.value.requirements) return [];
      
      let requirementsArray = [];
      
      try {
        // Check if requirements is already a string representation of an array
        if (typeof job.value.requirements === 'string') {
          if (job.value.requirements.trim().startsWith('[')) {
            // It's a JSON string - parse it
            requirementsArray = JSON.parse(job.value.requirements);
          } else {
            // It's a regular string - split by commas
            requirementsArray = job.value.requirements.split(',').map(item => item.trim());
          }
        } else if (Array.isArray(job.value.requirements)) {
          // It's already an array
          requirementsArray = job.value.requirements;
        }
      } catch (e) {
        // If parsing fails, use it as is or empty array
        console.error('Error parsing requirements:', e);
        return [];
      }
      
      // Format each requirement
      return requirementsArray.map(req => {
        // Handle if requirement is not a string
        if (typeof req !== 'string') {
          return String(req);
        }
        
        // Remove quotes if present
        let formatted = req.replace(/^"|"$/g, '');
        
        // Replace underscores with spaces
        formatted = formatted.replace(/_/g, ' ');
        
        // Capitalize first letter of each word
        return formatted.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
    });
    
    // Get user role from JWT
    const getUserRole = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode the JWT token to get user role
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decodedToken = JSON.parse(atob(base64));
          userRole.value = decodedToken.role;
          console.log('User role:', userRole.value);
        } catch (error) {
          console.error('Error decoding token:', error);
          userRole.value = '';
        }
      }
    };
    
    // Fetch job details
    const fetchJobDetails = async () => {
      try {
        loading.value = true;
        const response = await apiClient.get(`/jobs/${jobId}`);
        job.value = response.data;
        loading.value = false;
        
        // Check if jobseeker has applied to this job
        if (userRole.value === 'jobseeker') {
          checkApplicationStatus();
          checkSavedStatus();
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        loading.value = false;
      }
    };
    
    // Check if the jobseeker has already applied to this job
    const checkApplicationStatus = async () => {
      try {
        const response = await apiClient.get(`/applications/check/${jobId}`);
        hasApplied.value = response.data.hasApplied;
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
    
    // Check if the job is saved by the jobseeker
    const checkSavedStatus = async () => {
      try {
        const response = await apiClient.get(`/jobs/saved/check/${jobId}`);
        isSaved.value = response.data.isSaved;
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    
    // Toggle save/unsave job
    const toggleSavedJob = async () => {
      try {
        if (isSaved.value) {
          // Remove from saved jobs
          await apiClient.delete(`/jobs/saved/${jobId}`);
        } else {
          // Add to saved jobs
          await apiClient.post(`/jobs/saved/${jobId}`);
        }
        // Toggle local state
        isSaved.value = !isSaved.value;
      } catch (error) {
        console.error('Error toggling saved job:', error);
        alert('Failed to update saved status. Please try again.');
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
    
    // Toggle job active status
    const toggleJobStatus = async () => {
      if (!job.value) return;
      
      try {
        const response = await apiClient.put(`/jobs/${jobId}`, {
          active: !job.value.active
        });
        
        if (response.status === 200) {
          job.value.active = !job.value.active;
        }
      } catch (error) {
        console.error('Error updating job status:', error);
        alert('Failed to update job status. Please try again.');
      }
    };
    
    // Show delete confirmation modal
    const confirmDeleteJob = () => {
      showDeleteModal.value = true;
    };
    
    // Delete job after confirmation
    const deleteJob = async () => {
      try {
        const response = await apiClient.delete(`/jobs/${jobId}`);
        
        if (response.status === 200) {
          alert('Job has been deleted successfully.');
          router.push('/employer-dashboard');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
        showDeleteModal.value = false;
      }
    };
    
    // Fetch job data on component mount
    onMounted(() => {
      getUserRole();
      fetchJobDetails();
    });
    
    return {
      job,
      loading,
      showDeleteModal,
      userRole,
      hasApplied,
      isSaved,
      formattedRequirements,
      formatDate,
      formatEmploymentType,
      formatSalaryPeriod,
      toggleJobStatus,
      confirmDeleteJob,
      deleteJob,
      toggleSavedJob
    };
  }
};
</script>

  <style scoped>
  .job-details-container {
    max-width: 800px;
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
    color: #4CAF50;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    font-weight: 500;
  }
  
  .back-link a:hover {
    text-decoration: underline;
  }
  
  .loading-indicator, .error-state {
    text-align: center;
    padding: 40px 0;
    color: #6c757d;
  }
  
  .btn-primary {
    display: inline-block;
    margin-top: 15px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border-radius: 4px;
    text-decoration: none;
  }
  
  .job-details-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  
  .job-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }
  
  .job-status {
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .job-status.active {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .job-status.inactive {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .job-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 25px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .meta-icon {
    font-size: 18px;
  }
  
  .meta-text {
    font-size: 16px;
    color: #495057;
  }
  
  .job-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 15px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin-bottom: 25px;
  }
  
  .stat-item {
    display: flex;
    gap: 5px;
  }
  
  .stat-label {
    font-weight: 500;
    color: #6c757d;
  }
  
  .stat-value {
    color: #212529;
  }
  
  .job-section {
    margin-bottom: 25px;
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .section-content {
    color: #495057;
    line-height: 1.6;
  }
  
  .job-description, .job-benefits {
    white-space: pre-line;
    margin: 0;
  }
  
  .requirements-list {
    padding-left: 20px;
    margin: 0;
    list-style-type: disc;
  }
  
  .requirements-list li {
    margin-bottom: 8px;
    color: #495057;
  }
  
  .empty-content {
    color: #6c757d;
    font-style: italic;
  }
  
  .job-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .action-btn {
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ced4da;
  }
  
  .action-btn:hover {
    background-color: #e9ecef;
  }
  
  .action-btn.deactivate {
    background-color: #fff8e1;
    color: #f57f17;
    border-color: #ffe082;
  }
  
  .action-btn.activate {
    background-color: #e8f5e9;
    color: #2e7d32;
    border-color: #a5d6a7;
  }
  
  .action-btn.delete {
    background-color: #ffebee;
    color: #c62828;
    border-color: #ef9a9a;
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
    .job-header {
      flex-direction: column;
      gap: 10px;
    }
    
    .job-meta, .job-stats {
      flex-direction: column;
      gap: 10px;
    }
    
    .job-actions {
      flex-direction: column;
    }
    
    .action-btn {
      width: 100%;
    }
  }
  </style>