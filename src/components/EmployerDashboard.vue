<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">Employer Dashboard</h1>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Active Jobs</h3>
        <p class="stat-number">{{ activeJobsCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Applications</h3>
        <p class="stat-number">{{ totalApplications }}</p>
      </div>
      <div class="stat-card">
        <h3>New Messages</h3>
        <p class="stat-number">{{ unreadMessages }}</p>
      </div>
    </div>
    
    <div class="dashboard-actions">
      <router-link to="/post-job" class="action-btn primary">
        <span class="action-icon">+</span>
        <span>Post a New Job</span>
      </router-link>
      
      <router-link to="/my-profile" class="action-btn">
        <span>View My Profile</span>
      </router-link>
    </div>
    
    <div class="my-jobs-section">
      <div class="section-header">
        <h2>My Job Listings</h2>
        <div class="filter-controls">
          <button 
            @click="filterStatus = 'all'" 
            :class="['filter-btn', filterStatus === 'all' ? 'active' : '']"
          >
            All
          </button>
          <button 
            @click="filterStatus = 'active'" 
            :class="['filter-btn', filterStatus === 'active' ? 'active' : '']"
          >
            Active
          </button>
          <button 
            @click="filterStatus = 'inactive'" 
            :class="['filter-btn', filterStatus === 'inactive' ? 'active' : '']"
          >
            Inactive
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <p>Loading job listings...</p>
      </div>
      
      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        <p v-if="filterStatus === 'all'">You haven't posted any jobs yet.</p>
        <p v-else>No {{ filterStatus }} jobs found.</p>
        <router-link to="/post-job" class="primary-btn">Post Your First Job</router-link>
      </div>
      
      <div v-else class="job-listings">
        <div 
          v-for="job in filteredJobs" 
          :key="job._id" 
          class="job-card" 
          @click="viewJobDetails(job._id)"
        >
          <div class="job-status" :class="job.active ? 'active' : 'inactive'">
            {{ job.active ? 'Active' : 'Inactive' }}
          </div>
          <h3 class="job-title">{{ job.title }}</h3>
          <div class="job-details">
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
              <span class="stat-label">Applications:</span>
              {{ job.applications ? job.applications.length : 0 }}
            </span>
          </div>
          <div class="job-actions" @click.stop>
            <router-link :to="`/job-applications/${job._id}`" class="action-link">
              View Applications
            </router-link>
            <router-link :to="`/edit-job/${job._id}`" class="action-link">
              Edit
            </router-link>
            <button class="action-link danger" @click="toggleJobStatus(job)">
              {{ job.active ? 'Deactivate' : 'Activate' }}
            </button>
            <button class="action-link danger" @click="confirmDeleteJob(job)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete the job "<strong>{{ jobToDelete?.title }}</strong>"?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="deleteJob" class="danger-btn">Delete Job</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/axios.js';

export default {
  name: 'EmployerDashboard',
  setup() {
    const router = useRouter();
    const jobs = ref([]);
    const loading = ref(true);
    const filterStatus = ref('all');
    const activeJobsCount = ref(0);
    const totalApplications = ref(0);
    const unreadMessages = ref(0); // Set to 0 by default instead of random
    const showDeleteModal = ref(false);
    const jobToDelete = ref(null);

    // Filter jobs based on status
    const filteredJobs = computed(() => {
      if (filterStatus.value === 'all') {
        return jobs.value;
      } else if (filterStatus.value === 'active') {
        return jobs.value.filter(job => job.active);
      } else {
        return jobs.value.filter(job => !job.active);
      }
    });

    // Fetch employer's jobs
    const fetchJobs = async () => {
      try {
        loading.value = true;
        const response = await apiClient.get('/jobs/my-jobs');
        jobs.value = response.data;
        
        // Calculate dashboard stats
        activeJobsCount.value = jobs.value.filter(job => job.active).length;
        totalApplications.value = jobs.value.reduce((total, job) => 
          total + (job.applications ? job.applications.length : 0), 0);
        
        // Messages count is now fixed at 0 until messaging is implemented
        // unreadMessages.value = 0; // Already set to 0 on initialization
        
        loading.value = false;
      } catch (error) {
        console.error('Error fetching jobs:', error);
        loading.value = false;
      }
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

    // Toggle job active status
    const toggleJobStatus = async (job) => {
      try {
        const response = await apiClient.put(`/jobs/${job._id}`, {
          active: !job.active
        });
        
        if (response.status === 200) {
          // Update job in the local array
          job.active = !job.active;
          
          // Update active jobs count
          activeJobsCount.value = jobs.value.filter(j => j.active).length;
        }
      } catch (error) {
        console.error('Error updating job status:', error);
        alert('Failed to update job status. Please try again.');
      }
    };

    // Show delete confirmation modal
    const confirmDeleteJob = (job) => {
      jobToDelete.value = job;
      showDeleteModal.value = true;
    };

    // Delete job after confirmation
    const deleteJob = async () => {
      if (!jobToDelete.value) return;
      
      try {
        const response = await apiClient.delete(`/jobs/${jobToDelete.value._id}`);
        
        if (response.status === 200) {
          // Remove job from the local array
          jobs.value = jobs.value.filter(job => job._id !== jobToDelete.value._id);
          
          // Update dashboard stats
          activeJobsCount.value = jobs.value.filter(job => job.active).length;
          totalApplications.value = jobs.value.reduce((total, job) => 
            total + (job.applications ? job.applications.length : 0), 0);
          
          // Close modal
          showDeleteModal.value = false;
          jobToDelete.value = null;
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    };

    // Fetch jobs when component is mounted
    onMounted(() => {
      fetchJobs();
    });

    return {
      jobs,
      loading,
      filterStatus,
      filteredJobs,
      activeJobsCount,
      totalApplications,
      unreadMessages,
      showDeleteModal,
      jobToDelete,
      formatDate,
      formatEmploymentType,
      formatSalaryPeriod,
      viewJobDetails,
      toggleJobStatus,
      confirmDeleteJob,
      deleteJob
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
.my-jobs-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Job Cards */
.job-listings {
  display: grid;
  gap: 15px;
}

.job-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.job-status {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
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

.job-actions {
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