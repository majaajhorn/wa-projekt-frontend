<template>
    <div class="edit-job-container">
      <h1 class="page-title">Edit Job Listing</h1>
      
      <div class="back-link">
        <router-link to="/employer-dashboard">
          &larr; Back to Dashboard
        </router-link>
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <p>Loading job details...</p>
      </div>
      
      <form v-else @submit.prevent="saveJob" class="job-form">
        <div class="form-section">
          <h2 class="section-title">Job Details</h2>
          
          <div class="form-group">
            <label for="title">Job Title*</label>
            <input 
              type="text" 
              id="title" 
              v-model="jobForm.title" 
              required 
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="location">Location*</label>
              <input 
                type="text" 
                id="location" 
                v-model="jobForm.location" 
                required 
                placeholder="e.g. London, UK"
              />
            </div>
            
            <div class="form-group">
              <label for="employmentType">Employment Type*</label>
              <select id="employmentType" v-model="jobForm.employmentType" required>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="salary">Salary*</label>
              <input 
                type="number" 
                id="salary" 
                v-model="jobForm.salary" 
                required
                min="0"
                step="1"
              />
            </div>
            
            <div class="form-group">
              <label for="salaryPeriod">Period*</label>
              <select id="salaryPeriod" v-model="jobForm.salaryPeriod" required>
                <option value="hourly">Per Hour</option>
                <option value="daily">Per Day</option>
                <option value="weekly">Per Week</option>
                <option value="monthly">Per Month</option>
                <option value="yearly">Per Year</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h2 class="section-title">Job Description</h2>
          
          <div class="form-group">
            <label for="description">Description*</label>
            <textarea 
              id="description" 
              v-model="jobForm.description" 
              rows="6" 
              required
              placeholder="Provide a detailed description of the job, responsibilities, etc."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="requirements">Requirements*</label>
            <textarea 
              id="requirements" 
              v-model="cleanedRequirements" 
              rows="4" 
              required
              placeholder="List the required qualifications and experiences for this position."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="benefits">Benefits (Optional)</label>
            <textarea 
              id="benefits" 
              v-model="jobForm.benefits" 
              rows="4"
              placeholder="Describe the benefits, perks, and other advantages of working in this position."
            ></textarea>
          </div>
        </div>
        
        <div class="form-section">
          <h2 class="section-title">Application Settings</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="deadline">Application Deadline (Optional)</label>
              <input type="date" id="deadline" v-model="jobForm.applicationDeadline" />
            </div>
            
            <div class="form-group">
              <label for="positions">Number of Positions*</label>
              <input 
                type="number" 
                id="positions" 
                v-model="jobForm.positions" 
                required
                min="1"
                step="1"
              />
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="cancelEdit" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn">Save Changes</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'EditJob',
    setup() {
      const route = useRoute();
      const router = useRouter();
      const jobId = route.params.id;
      const loading = ref(true);
      
      // Initialize job form with default values
      const jobForm = reactive({
        title: '',
        location: '',
        description: '',
        employmentType: 'full_time',
        salary: '',
        salaryPeriod: 'yearly',
        requirements: '',
        benefits: '',
        applicationDeadline: '',
        positions: 1
      });
      
      // Create a computed property to clean the requirements text
      const cleanedRequirements = computed({
        get: () => {
          // If requirements contain the default text (fully or partially), return empty string
          const defaultText = 'english_fluent,qualification_required,experience_required';
          if (jobForm.requirements.includes(defaultText) || 
              jobForm.requirements === 'english_fluent' ||
              jobForm.requirements === 'qualification_required' ||
              jobForm.requirements === 'experience_required') {
            return '';
          }
          return jobForm.requirements;
        },
        set: (value) => {
          jobForm.requirements = value;
        }
      });
      
      // Fetch job data
      const fetchJobData = async () => {
        try {
          loading.value = true;
          const response = await apiClient.get(`/jobs/${jobId}`);
          
          // Update the form with the fetched job data
          const job = response.data;
          
          // Populate form fields from job data
          Object.keys(jobForm).forEach(key => {
            if (job[key] !== undefined) {
              // We'll handle requirements field separately using the computed property
              if (key !== 'requirements') {
                jobForm[key] = job[key];
              } else {
                // If it's the default text, we set an empty string
                const defaultText = 'english_fluent,qualification_required,experience_required';
                if (job[key] === defaultText || 
                    job[key] === 'english_fluent' || 
                    job[key] === 'qualification_required' || 
                    job[key] === 'experience_required') {
                  jobForm[key] = '';
                } else {
                  jobForm[key] = job[key] || '';
                }
              }
            }
          });
          
          // Format date for input type="date"
          if (job.applicationDeadline) {
            const date = new Date(job.applicationDeadline);
            jobForm.applicationDeadline = date.toISOString().split('T')[0];
          }
          
          loading.value = false;
        } catch (error) {
          console.error('Error fetching job data:', error);
          alert('Failed to load job data. Redirecting to dashboard.');
          router.push('/employer-dashboard');
        }
      };
      
      // Save updated job
      const saveJob = async () => {
        try {
          // If using default requirements text, change to empty
          if (jobForm.requirements === 'english_fluent,qualification_required,experience_required') {
            jobForm.requirements = '';
          }
          
          const response = await apiClient.put(`/jobs/${jobId}`, jobForm);
          
          if (response.status === 200) {
            alert('Job updated successfully!');
            router.push('/employer-dashboard');
          }
        } catch (error) {
          console.error('Error updating job:', error);
          alert('Failed to update job. Please try again.');
        }
      };
      
      // Cancel edit and return to dashboard
      const cancelEdit = () => {
        const confirmCancel = confirm('Are you sure you want to cancel? Any unsaved changes will be lost.');
        if (confirmCancel) {
          router.push('/employer-dashboard');
        }
      };
      
      // Fetch job data on component mount
      onMounted(() => {
        fetchJobData();
      });
      
      return {
        loading,
        jobForm,
        cleanedRequirements,
        saveJob,
        cancelEdit
      };
    }
  };
  </script>
  
  <style scoped>
  .edit-job-container {
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
    color: #4CAF50;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    font-weight: 500;
  }
  
  .back-link a:hover {
    text-decoration: underline;
  }
  
  /* Form Sections */
  .form-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  /* Form Groups */
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #495057;
  }
  
  .form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    color: #212529;
  }
  
  .form-group textarea {
    resize: vertical;
  }
  
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  /* Form Actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }
  
  .cancel-btn {
    padding: 12px 20px;
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .save-btn {
    padding: 12px 30px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .save-btn:hover {
    background-color: #45a049;
  }
  
  /* Loading Indicator */
  .loading-indicator {
    text-align: center;
    padding: 40px 0;
    color: #6c757d;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
  </style>