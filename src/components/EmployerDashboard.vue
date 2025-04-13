<template>
  <div v-if="showChangePasswordForm">
    <ChangePassword @password-changed="handlePasswordChanged" />
  </div>

  <div class="dashboard-container">
    <h1 class="dashboard-title">Employer Dashboard</h1>
    
    <div class="dashboard-stats">
      <div class="stat-card" @click="scrollToJobs" style="cursor: pointer;">
        <h3>Active Jobs</h3>
        <p class="stat-number">{{ activeJobsCount }}</p>
      </div>
      <div class="stat-card" @click="scrollToApplications" style="cursor: pointer;">
        <h3>Total Applications</h3>
        <p class="stat-number">{{ totalApplications }}</p>
      </div>
      <div class="stat-card" @click="scrollToApplications" style="cursor: pointer;">
        <h3>New Applications</h3>
        <p class="stat-number">{{ newApplicationsCount }}</p>
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
    
    <!-- New tabbed interface -->
    <div class="dashboard-tabs">
      <button 
        @click="switchTab('jobs')" 
        :class="['tab-btn', activeTab === 'jobs' ? 'active-tab' : '']"
      >
        My Jobs
      </button>
      <button 
        @click="switchTab('applications')" 
        :class="['tab-btn', activeTab === 'applications' ? 'active-tab' : '']"
      >
        Applications
      </button>
      <button 
        @click="switchTab('reviews')" 
        :class="['tab-btn', activeTab === 'reviews' ? 'active-tab' : '']"
        v-if="hiredApplicants.length > 0"
      >
        Reviews
      </button>
    </div>
    
    <!-- Jobs Tab Content -->
    <div v-if="activeTab === 'jobs'" class="tab-content">
      <div class="my-jobs-section" ref="jobsSection">
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
        
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchJobs" class="primary-btn">Try Again</button>
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
                <span :class="{'highlight': job.applications && job.applications.length > 0}">
                  {{ job.applications ? job.applications.length : 0 }}
                </span>
              </span>
            </div>
            <div class="job-actions" @click.stop>
              <router-link :to="'/all-applications'" class="action-link">
                View Applications
                <span v-if="job.applications && job.applications.length > 0" class="application-badge">
                  {{ job.applications.length }}
                </span>
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
    </div>
    
    <!-- Applications Tab Content -->
    <div v-if="activeTab === 'applications'" class="tab-content">
      <div v-if="visibleApplications.length > 0" class="recent-applications-section" ref="applicationsSection">
        <div class="section-header">
          <h2>Recent Applications</h2>
          <router-link to="/all-applications" class="view-all-link">
            View All
          </router-link>
        </div>
        
        <div class="application-listings">
          <div 
            v-for="application in visibleApplications" 
            :key="application._id" 
            class="application-card"
          >
            <div class="application-header">
              <div class="application-job-title">{{ application.job?.title }}</div>
              <div class="application-status" :class="application.status.toLowerCase()">
                {{ application.status }}
              </div>
            </div>
            <div class="applicant-info">
              <h4 class="applicant-name">{{ getApplicantName(application) }}</h4>
              <p class="applicant-email">✉️ {{ getApplicantEmail(application) }}</p>
              <p v-if="application.applicant?.phone" class="applicant-phone">📞 {{ application.applicant?.phone }}</p>
            </div>
            <div class="application-meta">
              <p class="application-date">Applied: {{ formatDate(application.appliedDate) }}</p>
            </div>
            <div class="application-actions">
              <router-link :to="`/application-details/${application._id}`" class="action-link view">
                View Application
              </router-link>
              <div class="status-actions" v-if="application.status === 'Pending'">
                <button @click="updateApplicationStatus(application._id, 'Hired')" class="action-link approve" style="padding: 8px 12px; margin-right: 8px;">
                  Approve Application
                </button>
                <button @click="updateApplicationStatus(application._id, 'Rejected')" class="action-link reject" style="padding: 8px 12px;">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>You don't have any applications yet.</p>
      </div>
    </div>
    
    <!-- Reviews Tab Content -->
    <div v-if="activeTab === 'reviews'" class="tab-content">
      <div class="reviewable-jobseekers-section">
        <div class="section-header">
          <h2>Rate Your Talent</h2>
        </div>
        
        <div class="jobseekers-list">
          <div v-for="applicant in hiredApplicants" :key="applicant._id" class="jobseeker-card">
            <div class="jobseeker-info">
              <h3 class="jobseeker-name">{{ getApplicantName(applicant) }}</h3>
              <p class="jobseeker-job">Hired for: {{ applicant.job?.title || 'Unknown position' }}</p>
              <p class="jobseeker-hired-date">Hired on: {{ formatDate(applicant.statusUpdateDate || applicant.appliedDate) }}</p>
            </div>
            
            <div class="jobseeker-actions">
              <router-link :to="`/jobseeker-profile/${applicant.applicantId}`" class="view-profile-btn">
                View Profile
              </router-link>
              <button 
                @click="showReviewModal(applicant.applicantId)" 
                class="review-btn"
                :disabled="applicant.hasReviewed"
              >
                {{ applicant.hasReviewed ? 'Already Reviewed' : 'Leave Review' }}
              </button>
            </div>
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

    <!-- Review Modal -->
    <div v-if="showReviewModalFlag" class="modal-backdrop">
      <div class="modal-content review-modal">
        <div class="modal-header">
          <h3>Review Jobseeker</h3>
          <button @click="closeReviewModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <ReviewForm 
            :jobseekerId="selectedJobseekerId" 
            @review-submitted="handleReviewSubmitted" 
          />
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/axios.js';
import { applicationStatusService } from '../services/applicationStatusService';
import ChangePassword from './ChangePassword.vue'; 
import ReviewForm from './ReviewForm.vue'; 
import { reviewService } from '../services/reviewService';

export default {
  name: 'EmployerDashboard',
  components: {
    ChangePassword,
    ReviewForm
  },
  setup() {
    const router = useRouter();
    const jobs = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const filterStatus = ref('all');
    const activeJobsCount = ref(0);
    const totalApplications = ref(0);
    const newApplicationsCount = ref(0);
    const showDeleteModal = ref(false);
    const jobToDelete = ref(null);
    const allApplications = ref([]);
    const loadingApplications = ref(false);
    const jobsSection = ref(null);
    const applicationsSection = ref(null);
    const showChangePasswordForm = ref(false);
    const hiredApplicants = ref([]);
    const showReviewModalFlag = ref(false);
    const selectedJobseekerId = ref(null);
    const activeTab = ref('jobs');

    // function to handle tab switching
    const switchTab = (tab) => {
      activeTab.value = tab;
    };

    // Add this function to fetch hired applicants
    const fetchHiredApplicants = async () => {
      try {
        // First get all applications
        const response = await apiClient.get('/applications/employer-applications');
        
        if (response.data && Array.isArray(response.data)) {
          // Filter for hired applicants only
          const hired = response.data.filter(app => app.status === 'Hired');
          
          // Check which jobseekers have already been reviewed
          const hiredWithReviewStatus = await Promise.all(
            hired.map(async (applicant) => {
              try {
                // Only check if we have an applicantId
                if (applicant.applicantId) {
                  const reviewCheck = await reviewService.checkIfReviewed(applicant.applicantId);
                  return {
                    ...applicant,
                    hasReviewed: reviewCheck.data.hasReviewed
                  };
                }
                return { ...applicant, hasReviewed: false };
              } catch (error) {
                console.error('Error checking review status:', error);
                return { ...applicant, hasReviewed: false };
              }
            })
          );
          
          hiredApplicants.value = hiredWithReviewStatus;
        }
      } catch (error) {
        console.error('Error fetching hired applicants:', error);
      }
    };

    // Add these methods for the review modal
    const showReviewModal = (jobseekerId) => {
      selectedJobseekerId.value = jobseekerId;
      showReviewModalFlag.value = true;
    };

    const closeReviewModal = () => {
      showReviewModalFlag.value = false;
      selectedJobseekerId.value = null;
    };

    const handleReviewSubmitted = () => {
      closeReviewModal();
      // Refresh the list of hired applicants to update review status
      fetchHiredApplicants();
    };

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

    // Changed to computed property: Filter applications to exclude rejected ones
    const visibleApplications = computed(() => {
      // Filter out rejected applications
      const nonRejected = allApplications.value.filter(app => app.status !== 'Rejected');
      
      // Sort by date (newest first) and take max 3
      return nonRejected
        .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
        .slice(0, 3);
    });

    // Helper methods for applicant data display
    const getApplicantName = (application) => {
      // Check if application has an applicant object
      if (!application || !application.applicant) return 'Unknown Applicant';
      
      // If the applicant has fullName, use it directly (from MongoDB format)
      if (application.applicant.fullName) {
        return application.applicant.fullName;
      }
      
      // If the applicant has firstName and lastName, combine them
      if (application.applicant.firstName && application.applicant.lastName) {
        return `${application.applicant.firstName} ${application.applicant.lastName}`;
      }
      
      // Fallback if neither format is available
      return application.applicant.name || 'Unknown Applicant';
    };

    const getApplicantEmail = (application) => {
      // Check if application has an applicant object with email
      if (!application || !application.applicant) return 'email@example.com';
      
      // Return the email if it exists
      return application.applicant.email || 'email@example.com';
    };

    // Modified fetchJobs function to fix the job loading issue
    const fetchJobs = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Get token and check if it exists
        const token = localStorage.getItem('token');
        if (!token) {
          error.value = 'Authentication token not found. Please log in again.';
          loading.value = false;
          return;
        }
        
        // For debugging - log user info
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', user);
        
        try {
          // First try the my-jobs endpoint
          const response = await apiClient.get('/jobs/my-jobs');
          jobs.value = response.data;
          console.log('My jobs response:', response.data);
        } catch (err) {
          console.error('Error fetching my-jobs:', err);
          
          // Fallback: get all jobs and filter by employerId
          const allJobsResponse = await apiClient.get('/jobs');
          console.log('All jobs response:', allJobsResponse.data);
          
          // If user ID is available, filter the jobs
          if (user && user.id) {
            jobs.value = allJobsResponse.data.filter(job => job.employerId === user.id);
            console.log(`Filtered ${jobs.value.length} jobs for employer ID: ${user.id}`);
          } else {
            // If no user ID, just use all jobs (not ideal but better than nothing)
            jobs.value = allJobsResponse.data;
          }
        }
        
        // Calculate dashboard stats
        activeJobsCount.value = jobs.value.filter(job => job.active).length;
        totalApplications.value = jobs.value.reduce((total, job) => 
          total + (job.applications ? job.applications.length : 0), 0);
        
        loading.value = false;
      } catch (err) {
        console.error('Error fetching jobs:', err);
        if (err.response) {
          console.error('Server response:', err.response.data);
          error.value = `Error: ${err.response.data.message || 'Failed to load jobs'}`;
        } else {
          error.value = 'Network error. Please check your connection and try again.';
        }
        loading.value = false;
      }
    };

    // Enhanced fetchRecentApplications function
    const fetchRecentApplications = async () => {
      try {
        loadingApplications.value = true;
        
        // First check localStorage for any saved application data
        try {
          const savedData = localStorage.getItem('applicationData');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            
            // If we have saved application data, use it as the initial source
            if (parsed && Object.keys(parsed).length > 0) {
              console.log('Found saved application data in localStorage:', parsed);
              
              // Convert from object to array
              const savedApps = Object.values(parsed);
              
              // Set to raw applications array (visibleApplications computed property will handle filtering)
              allApplications.value = savedApps;
              
              // Count pending applications
              newApplicationsCount.value = savedApps.filter(app => app.status === 'Pending').length;
              
              // No need to wait for API if we already have data
              loadingApplications.value = false;
              
              // Still try to fetch from API for latest data, but don't block UI
              fetchFromAPI().catch(err => {
                console.warn('Background API fetch failed:', err);
              });
              
              return;
            }
          }
        } catch (storageError) {
          console.error('Error reading from localStorage:', storageError);
          // Continue to API fetch if localStorage fails
        }
        
        // If no localStorage data, continue with API fetch
        await fetchFromAPI();
        loadingApplications.value = false;
      } catch (error) {
        console.error('Error in fetchRecentApplications:', error);
        loadingApplications.value = false;
      }
      
      // Helper function to fetch from API and handle errors
      async function fetchFromAPI() {
        // Try the API first to get detailed applicant info
        try {
          const response = await apiClient.get('/applications/employer-applications');
          
          // Check if we got proper data with applicant information
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log('Got applications from API with applicant details:', response.data);
            
            // Process the applications
            const apiApps = response.data.map(app => {
              // Ensure all required fields
              return {
                ...app,
                job: app.job || { title: 'Unknown Job' },
                applicant: app.applicant || {
                  fullName: 'Unknown Applicant',
                  email: 'email@example.com'
                }
              };
            });
            
            // Check for any saved status updates in localStorage
            try {
              const savedData = localStorage.getItem('applicationData');
              if (savedData) {
                const parsed = JSON.parse(savedData);
                
                // Update API data with any saved status changes
                if (parsed && Object.keys(parsed).length > 0) {
                  for (const app of apiApps) {
                    if (parsed[app._id]) {
                      // Keep applicant details from API but update status from localStorage
                      app.status = parsed[app._id].status;
                    }
                  }
                }
              }
            } catch (mergeError) {
              console.warn('Error merging localStorage data:', mergeError);
            }
            
            // Store all applications in the ref
            allApplications.value = apiApps;
            
            // Count new (pending) applications
            newApplicationsCount.value = apiApps.filter(app => app.status === 'Pending').length;
            return;
          } else {
            throw new Error('No valid application data returned from API');
          }
        } catch (apiError) {
          console.error('Error fetching applications via API:', apiError);
          
          // Fallback: For each job, try to get detailed application data
          const jobApplications = [];
          
          for (const job of jobs.value) {
            if (job.applications && job.applications.length > 0) {
              console.log(`Job ${job.title} has ${job.applications.length} applications`);
              
              // For each application ID, try to get application details
              for (const appId of job.applications) {
                try {
                  // Try to get detailed application info including applicant details
                  const appResponse = await apiClient.get(`/applications/${appId}`);
                  
                  if (appResponse.data) {
                    // Get applicant data if possible
                    let applicantData = appResponse.data.applicant;
                    
                    // If we have an applicantId but no applicant data, try to fetch user details
                    if (!applicantData && appResponse.data.applicantId) {
                      try {
                        const userResponse = await apiClient.get(`/users/${appResponse.data.applicantId}`);
                        if (userResponse.data) {
                          applicantData = userResponse.data;
                        }
                      } catch (userErr) {
                        console.warn(`Could not fetch user data for applicant ${appResponse.data.applicantId}:`, userErr);
                      }
                    }
                    
                    jobApplications.push({
                      ...appResponse.data,
                      job: job,
                      applicant: applicantData || {
                        fullName: 'Unknown Applicant',
                        email: 'email@example.com'
                      }
                    });
                    console.log(`Got application details for ${appId}:`, appResponse.data);
                  } else {
                    // Fallback to basic info if we can't get detailed info
                    jobApplications.push({
                      _id: appId,
                      jobId: job._id,
                      job: job,
                      status: 'Pending',
                      applicant: {
                        fullName: 'Unknown Applicant',
                        email: 'email@example.com'
                      },
                      appliedDate: job.postedDate || new Date().toISOString()
                    });
                  }
                } catch (appErr) {
                  console.error(`Could not fetch application ${appId}:`, appErr);
                }
              }
            }
          }
          
          // Check for any saved status updates in localStorage for the fallback data
          try {
            const savedData = localStorage.getItem('applicationData');
            if (savedData) {
              const parsed = JSON.parse(savedData);
              
              if (parsed && Object.keys(parsed).length > 0) {
                for (const app of jobApplications) {
                  if (parsed[app._id]) {
                    // Update status from localStorage, preserve applicant info
                    const savedApp = parsed[app._id];
                    app.status = savedApp.status;
                    
                    // If savedApp has better applicant info, use it
                    if (savedApp.applicant && 
                        (savedApp.applicant.fullName || 
                         (savedApp.applicant.firstName && savedApp.applicant.lastName))) {
                      app.applicant = savedApp.applicant;
                    }
                  }
                }
              }
            }
          } catch (updateError) {
            console.warn('Error updating with localStorage data:', updateError);
          }
          
          // If we found applications this way, use them
          if (jobApplications.length > 0) {
            // Store all applications (visibleApplications computed prop will handle filtering)
            allApplications.value = jobApplications;
            
            // Count pending applications
            newApplicationsCount.value = jobApplications.filter(app => app.status === 'Pending').length;
          } else {
            // If we still don't have applications, create a default set
            let defaultApps = [];
            
            for (const job of jobs.value) {
              // Create a default application if the job has applications array
              if (job.applications && job.applications.length > 0) {
                const defaultApp = {
                  _id: job.applications[0],
                  jobId: job._id,
                  job: job,
                  status: 'Pending',
                  applicant: {
                    fullName: 'Unknown Applicant',
                    email: 'unknown@example.com'
                  },
                  appliedDate: job.postedDate || new Date().toISOString()
                };
                defaultApps.push(defaultApp);
              }
            }
            
            if (defaultApps.length > 0) {
              allApplications.value = defaultApps;
              newApplicationsCount.value = defaultApps.filter(app => app.status === 'Pending').length;
            }
          }
        }
      }
    };

    const updateApplicationStatus = async (applicationId, newStatus) => {
      try {
        // Find the application in our local array
        const application = allApplications.value.find(app => app._id === applicationId);
        
        if (application) {
          // Store previous status
          const previousStatus = application.status;
          
          // Update UI immediately
          application.status = newStatus;
          
          // CRITICAL: Store the complete application data with the new status
          // This ensures we keep applicant details too
          const applicationData = {
            ...application,
            status: newStatus,
            lastStatusUpdate: new Date().toISOString()
          };
          
          // Save to localStorage for persistence across page reloads
          try {
            // Get existing applications or create empty object
            let storedApplications = localStorage.getItem('applicationData') || '{}';
            storedApplications = JSON.parse(storedApplications);
            
            // Update this specific application
            storedApplications[applicationId] = applicationData;
            
            // Save back to localStorage
            localStorage.setItem('applicationData', JSON.stringify(storedApplications));
            console.log('Saved application data to localStorage:', applicationData);
          } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
          }
          
          // Now make the API call
          try {
            const response = await apiClient.put(`/applications/${applicationId}/status`, {
              status: newStatus
            });
            
            console.log('Status update response:', response);
            
            if (response.status === 200) {
              // Success - update counters
              if (newStatus !== 'Pending') {
                newApplicationsCount.value = Math.max(0, newApplicationsCount.value - 1);
              }
              
              // Success message
              const successMessage = newStatus === 'Hired' ? 'Application approved successfully!' : 
                                  newStatus === 'Rejected' ? 'Application rejected' : 
                                  'Application status updated successfully';
              
              alert(successMessage);
            }
          } catch (apiError) {
            console.error('API error when updating status:', apiError);
            
            // Show error message
            if (apiError.response && apiError.response.data) {
              console.warn(`API error: ${apiError.response.data.message || 'Unknown error'}`);
            }
            
            // Non-blocking success message - since UI shows what user wanted
            const actionMessage = newStatus === 'Hired' ? 'Application approved!' : 
                                newStatus === 'Rejected' ? 'Application rejected' : 
                                'Status updated';
            
            alert(`${actionMessage} (Note: Changes may not be saved to the server)`);
          }
        } else {
          console.error(`Application with ID ${applicationId} not found`);
          alert('Could not find the application to update.');
        }
      } catch (error) {
        console.error('Error in updateApplicationStatus:', error);
        alert('An unexpected error occurred.');
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

    const scrollToJobs = () => {
      if (jobsSection.value) {
        jobsSection.value.scrollIntoView({ 
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

    // Fetch jobs and applications when component is mounted
    onMounted(() => {
      fetchJobs().then(() => {
        fetchRecentApplications();
        fetchHiredApplicants();
      });

      // Check if user has a temporary password
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.passwordTemporary) {
        showChangePasswordForm.value = true;
      }
    });

    return {
      jobs,
      loading,
      error,
      filterStatus,
      filteredJobs,
      activeJobsCount,
      totalApplications,
      newApplicationsCount,
      showDeleteModal,
      jobToDelete,
      allApplications,
      visibleApplications,
      loadingApplications,
      jobsSection,
      applicationsSection,
      scrollToJobs,
      scrollToApplications,
      formatDate,
      formatEmploymentType,
      formatSalaryPeriod,
      viewJobDetails,
      toggleJobStatus,
      confirmDeleteJob,
      deleteJob,
      updateApplicationStatus,
      fetchJobs,
      getApplicantName,
      getApplicantEmail,
      hiredApplicants,
      showReviewModalFlag,
      selectedJobseekerId,
      showReviewModal,
      closeReviewModal,
      handleReviewSubmitted,
      activeTab,
      switchTab
    };
  }
};
</script>
  
<style scoped>
.recent-applications-section {
  margin-bottom: 30px;
}

.view-all-link {
  color: #4299e1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

.application-listings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.application-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.application-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.application-job-title {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.application-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.application-status.pending {
  background-color: #fefcbf;
  color: #744210;
}

.application-status.approved {
  background-color: #9ae6b4;
  color: #22543d;
}

.application-status.rejected {
  background-color: #fed7d7;
  color: #c53030;
}

.applicant-info {
  margin-bottom: 15px;
}

.applicant-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.applicant-email, .applicant-phone {
  font-size: 14px;
  color: #718096;
  margin: 0 0 4px 0;
}

.application-meta {
  font-size: 13px;
  color: #718096;
  margin-bottom: 15px;
}

.application-date {
  margin: 0;
}

.application-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-link.view {
  background-color: #ebf8ff;
  color: #3182ce;
  padding: 5px
}

.action-link.approve {
  background-color: #c6f6d5;
  color: #2f855a;
}

.action-link.reject {
  background-color: #fed7d7;
  color: #c53030;
}

.highlight {
  color: #4299e1;
  font-weight: 600;
}

.application-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #4299e1;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 5px;
  font-weight: 600;
}

.error-state {
  text-align: center;
  padding: 30px;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  color: #c53030;
  margin-bottom: 20px;
}

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
  color: #4299e1;
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
  background-color: #4299e1;
  color: white;
}

.action-btn.primary:hover {
  background-color: #007ce2;
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
  color: #4299e1;
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
  color: #4299e1;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: none;
}

.action-link:hover {
  color: #007ce2;
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
  background-color: #4299e1;
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
  background-color: #007ce2;
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

.reviewable-jobseekers-section {
  margin-top: 30px;
}

.jobseekers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.jobseeker-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.jobseeker-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.jobseeker-name {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
}

.jobseeker-job, .jobseeker-hired-date {
  color: #666;
  margin-bottom: 5px;
}

.jobseeker-actions {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.view-profile-btn, .review-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  flex: 1;
  border: none;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 46px; /* Ensure consistent height */
}

.view-profile-btn {
  background-color: #f5f5f5;
  color: #444;
}

.view-profile-btn:hover {
  background-color: #e8e8e8;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.review-btn {
  background-color: #4299e1;
  color: white;
}

.review-btn:hover:not(:disabled) {
  background-color: #007ce2;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.review-btn:disabled {
  background-color: #82b1d7;
  color: white;
  opacity: 0.9;
  cursor: not-allowed;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.close-btn:hover {
  color: #333;
}

.dashboard-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin: 20px 0;
  gap: 10px;
}

.tab-btn {
  padding: 12px 24px;
  font-size: 1rem;
  background: none;
  border: none;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px 8px 0 0;
}

.tab-btn:hover {
  background-color: #f5f5f5;
  color: #007ce2;
}

.tab-btn.active-tab {
  color: #007ce2;
  background-color: #f9f9f9;
  border-bottom: 3px solid #007ce2;
}

.tab-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: bold;
}

.tab-content {
  margin-top: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
  color: #666;
}
</style>