<template>
    <div class="job-post-container">
      <h1 class="page-title">Post a Job</h1>
      
      <div v-if="successMessage" class="success-alert">
        <p>{{ successMessage }}</p>
        <div class="action-buttons">
          <button @click="resetForm" class="primary-btn">Post Another Job</button>
          <router-link to="/employer-dashboard" class="secondary-btn">Back to Dashboard</router-link>
        </div>
      </div>
      
      <div v-else class="job-form-container">
        <form @submit.prevent="submitJob" class="job-form">
          <div class="form-group">
            <label for="jobTitle">Job Title *</label>
            <input 
              v-model="jobData.title" 
              id="jobTitle" 
              type="text" 
              placeholder="e.g. Live-in Carer for Elderly Lady"
              class="text-input" 
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group half-width">
              <label for="salary">Salary (£) *</label>
              <input 
                v-model="jobData.salary" 
                id="salary" 
                type="number" 
                placeholder="e.g. 35000"
                class="text-input" 
                required
              />
            </div>
            
            <div class="form-group half-width">
              <label for="salaryPeriod">Payment Period *</label>
              <div class="custom-select">
                <select v-model="jobData.salaryPeriod" id="salaryPeriod" required>
                  <option value="hourly">Per Hour</option>
                  <option value="daily">Per Day</option>
                  <option value="weekly">Per Week</option>
                  <option value="monthly">Per Month</option>
                  <option value="yearly">Per Year</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group half-width">
              <label for="employmentType">Employment Type *</label>
              <div class="custom-select">
                <select v-model="jobData.employmentType" id="employmentType" required>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
            </div>
            
            <div class="form-group half-width">
              <label for="location">Location *</label>
              <input 
                v-model="jobData.location" 
                id="location" 
                type="text" 
                placeholder="e.g. London"
                class="text-input" 
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Job Description *</label>
            <textarea 
              v-model="jobData.description" 
              id="description" 
              rows="8" 
              placeholder="Describe the job responsibilities, requirements, benefits, etc."
              class="text-area"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Key Requirements</label>
            <div class="modern-checkbox-group">
                <div v-for="option in requirementOptions" :key="option.value" class="modern-checkbox">
                    <label>
                    <input 
                        type="checkbox" 
                        :value="option.value" 
                        v-model="jobData.requirements" 
                    />
                    <span class="checkbox-custom"></span>
                    {{ option.label }}
                    </label>
                </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="goBack" class="cancel-btn">Cancel</button>
            <button type="submit" class="primary-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Posting...' : 'Post Job' }}
            </button>
          </div>
        </form>
      </div>
      
      <div v-if="errorMessage" class="error-alert">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'JobPost',
    setup() {
      const router = useRouter();
      const isSubmitting = ref(false);
      const successMessage = ref('');
      const errorMessage = ref('');
      
      // Job data form
      const jobData = reactive({
        title: '',
        salary: '',
        salaryPeriod: 'monthly',
        employmentType: 'full_time',
        location: '',
        description: '',
        requirements: []
      });
      
      // Options for requirements checkboxes
      const requirementOptions = ref([
        { value: 'drivers_license', label: 'Driving License Required' },
        { value: 'english_fluent', label: 'Fluent English' },
        { value: 'experience_required', label: 'Experience Required' },
        { value: 'live_in', label: 'Live-in Position' },
        { value: 'qualification_required', label: 'Formal Qualification Required' }
      ]);
      
      // Check if user is an employer
      const checkEmployerRole = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token found');
            router.push('/login');
            return false;
          }
          
          // Ensure userRole is set to employer before proceeding
          const userRole = localStorage.getItem('userRole');
          console.log('Current user role from localStorage:', userRole);
          
          if (userRole !== 'employer') {
            console.log('Setting missing role to employer');
            localStorage.setItem('userRole', 'employer');
          }
          
          const response = await apiClient.get('/auth/profile');
          console.log('Profile API response:', response.data);
          
          if (response.data.role !== 'employer') {
            console.error('User is not an employer, redirecting');
            router.push('/jobseeker-dashboard');
            return false;
          }
          
          return true;
        } catch (error) {
          console.error('Error checking user role:', error);
          errorMessage.value = 'Error validating user permissions. Please try again.';
          return false;
        }
      };
      
      // Submit job posting
      const submitJob = async () => {
        try {
          isSubmitting.value = true;
          errorMessage.value = '';
          
          // Double-check employer role before submitting
          const isEmployer = await checkEmployerRole();
          if (!isEmployer) {
            errorMessage.value = 'Only employers can post jobs.';
            isSubmitting.value = false;
            return;
          }
          
          // Validate the form
          if (!jobData.title || !jobData.salary || !jobData.location || !jobData.description) {
            errorMessage.value = 'Please fill in all required fields';
            isSubmitting.value = false;
            return;
          }
          
          // Format the job data
          const jobPayload = {
            ...jobData,
            postedDate: new Date().toISOString(),
            active: true
          };
          
          // Send to API
          const response = await apiClient.post('/jobs/create', jobPayload);
          
          // Show success message
          successMessage.value = 'Job posted successfully! It is now visible in the job listings.';
          isSubmitting.value = false;
        } catch (error) {
          console.error('Error posting job:', error);
          errorMessage.value = error.response?.data?.message || 'Error posting job. Please try again.';
          isSubmitting.value = false;
        }
      };
      
      // Reset the form for a new job
      const resetForm = () => {
        jobData.title = '';
        jobData.salary = '';
        jobData.salaryPeriod = 'monthly';
        jobData.employmentType = 'full_time';
        jobData.location = '';
        jobData.description = '';
        jobData.requirements = [];
        successMessage.value = '';
      };
      
      // Go back to previous page
      const goBack = () => {
        router.push('/employer-dashboard');
      };
      
      // Set role and check permissions when component is mounted
      onMounted(async () => {
        console.log('JobPost component mounted');
        // Set the userRole explicitly to ensure it's available to the route guard
        localStorage.setItem('userRole', 'employer');
        await checkEmployerRole();
      });
      
      return {
        jobData,
        requirementOptions,
        isSubmitting,
        successMessage,
        errorMessage,
        submitJob,
        resetForm,
        goBack
      };
    }
  };
  </script>
  
  <style scoped>
  .job-post-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #333;
  }
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 30px;
    color: #2c3e50;
    text-align: center;
  }
  
  .job-form-container {
    background-color: #f9f9f9;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .job-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 20px;
  }
  
  .form-group {
    margin-bottom: 5px;
    width: 100%;
  }
  
  .half-width {
    width: 50%;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #495057;
  }
  
  .text-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 15px;
    transition: border-color 0.2s;
  }
  
  .text-input:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
  
  .text-area {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 15px;
    resize: vertical;
    min-height: 150px;
    transition: border-color 0.2s;
  }
  
  .text-area:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
  
  /* Custom select */
  .custom-select {
    position: relative;
    width: 100%;
  }
  
  .custom-select select {
    appearance: none;
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 15px;
    background-color: white;
    cursor: pointer;
  }
  
  .custom-select select:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
  
  .custom-select::after {
    content: '▼';
    font-size: 12px;
    color: #495057;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  
  /* Modern checkboxes */
  .modern-checkbox-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .modern-checkbox {
    position: relative;
    padding-left: 30px;
    cursor: pointer;
    margin-bottom: 8px;
  }
  
  .modern-checkbox input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkbox-custom {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    background-color: white;
    border: 1px solid #ced4da;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .modern-checkbox:hover input ~ .checkbox-custom {
    border-color: #4CAF50;
  }
  
  .modern-checkbox input:checked ~ .checkbox-custom {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
  
  .checkbox-custom:after {
    content: "";
    position: absolute;
    display: none;
  }
  
  .modern-checkbox input:checked ~ .checkbox-custom:after {
    display: block;
  }
  
  .modern-checkbox .checkbox-custom:after {
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  /* Form actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 10px;
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
  }
  
  .primary-btn:hover {
    background-color: #45a049;
  }
  
  .primary-btn:disabled {
    background-color: #a0d4a3;
    cursor: not-allowed;
  }
  
  .secondary-btn {
    padding: 10px 20px;
    background-color: #f8f9fa;
    color: #4CAF50;
    border: 1px solid #4CAF50;
    border-radius: 25px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
  }
  
  .secondary-btn:hover {
    background-color: #f0f9f0;
  }
  
  .cancel-btn {
    padding: 10px 20px;
    background-color: #f1f3f5;
    color: #495057;
    border: 1px solid #ced4da;
    border-radius: 25px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .cancel-btn:hover {
    background-color: #e9ecef;
  }
  
  /* Alerts */
  .success-alert {
    background-color: #e8f5e9;
    border-left: 4px solid #4CAF50;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 4px;
  }
  
  .success-alert p {
    margin: 0 0 15px 0;
    color: #2e7d32;
    font-size: 16px;
  }
  
  .error-alert {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
    padding: 15px;
    margin-top: 20px;
    border-radius: 4px;
  }
  
  .error-alert p {
    margin: 0;
    color: #d32f2f;
    font-size: 15px;
  }
  
  .action-buttons {
    display: flex;
    gap: 15px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 10px;
    }
    
    .half-width {
      width: 100%;
    }
    
    .modern-checkbox-group {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      flex-direction: column;
      align-items: stretch;
    }
    
    .form-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
  </style>