<template>
    <div class="apply-job-container">
      <h1 class="page-title">Apply for Job</h1>
      
      <div v-if="loading" class="loading-indicator">
        <p>Loading job details...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="goBack" class="back-btn">Go Back</button>
      </div>
      
      <div v-else-if="applicationSubmitted" class="success-message">
        <h2>Application Submitted Successfully!</h2>
        <p>Your application for <strong>{{ job.title }}</strong> has been sent to the employer.</p>
        <div class="success-actions">
          <button @click="goToDashboard" class="primary-btn">Go to Dashboard</button>
          <button @click="viewJobDetails" class="secondary-btn">View Job Details</button>
        </div>
      </div>
      
      <div v-else class="application-content">
        <!-- Job Information Summary -->
        <div class="job-summary">
          <h2 class="job-title">{{ job.title }}</h2>
          <p class="job-company">{{ job.company }}</p>
          <div class="job-details">
            <span class="job-location">📍 {{ job.location }}</span>
            <span class="job-salary">💰 £{{ job.salary }} {{ formatSalaryPeriod(job.salaryPeriod) }}</span>
            <span class="job-type">🕒 {{ formatEmploymentType(job.employmentType) }}</span>
          </div>
        </div>
        
        <!-- Application Form -->
        <div class="application-form">
          <h2 class="section-title">Your Application</h2>
          
          <div class="form-group">
            <label for="coverLetter">Cover Letter <span class="required">*</span></label>
            <textarea 
              id="coverLetter" 
              v-model="formData.coverLetter" 
              class="form-control" 
              rows="8" 
              placeholder="Introduce yourself and explain why you're interested in this position..."
              :class="{ 'error-input': validationErrors.coverLetter }"
            ></textarea>
            <div v-if="validationErrors.coverLetter" class="error-message">
              {{ validationErrors.coverLetter }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="additionalNotes">Additional Notes</label>
            <textarea 
              id="additionalNotes" 
              v-model="formData.additionalNotes" 
              class="form-control" 
              rows="4" 
              placeholder="Any other information you'd like to share with the employer..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="resume">Resume/CV</label>
            <div class="resume-upload">
              <input 
                type="file" 
                id="resume" 
                ref="resumeInput" 
                @change="handleFileUpload" 
                accept=".pdf,.doc,.docx"
                class="file-input"
              />
              <label for="resume" class="upload-btn">
                <span v-if="!formData.resumeFile">Choose File</span>
                <span v-else>Replace File</span>
              </label>
              <span class="file-name" v-if="formData.resumeFile">
                {{ formData.resumeFile.name }}
              </span>
              <button 
                v-if="formData.resumeFile" 
                @click="removeFile" 
                class="remove-file-btn"
                type="button"
              >
                Remove
              </button>
            </div>
            <div class="file-formats">Accepted formats: PDF, DOC, DOCX (Max: 5MB)</div>
          </div>
          
          <div class="confirmation-check">
            <input 
              type="checkbox" 
              id="confirmation" 
              v-model="formData.confirmed"
              :class="{ 'error-input': validationErrors.confirmed }"
            />
            <label for="confirmation">
              I confirm that all information provided is accurate and complete <span class="required">*</span>
            </label>
          </div>
          <div v-if="validationErrors.confirmed" class="error-message">
            {{ validationErrors.confirmed }}
          </div>
          
          <div class="form-actions">
            <button @click="goBack" class="back-btn">Cancel</button>
            <button @click="submitApplication" class="submit-btn" :disabled="submitting">
              <span v-if="submitting">Submitting...</span>
              <span v-else>Submit Application</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import apiClient from '../api/axios.js';
  
  export default {
    name: 'ApplyJob',
    setup() {
      const router = useRouter();
      const route = useRoute();
      
      const jobId = route.params.id;
      const job = ref({});
      const loading = ref(true);
      const error = ref(null);
      const submitting = ref(false);
      const applicationSubmitted = ref(false);
      const resumeInput = ref(null);
      
      // Form data
      const formData = reactive({
        coverLetter: '',
        additionalNotes: '',
        resumeFile: null,
        confirmed: false
      });
      
      // Validation errors
      const validationErrors = reactive({
        coverLetter: '',
        confirmed: ''
      });
      
      // Fetch job details
      const fetchJobDetails = async () => {
        try {
          loading.value = true;
          error.value = null;
          
          const response = await apiClient.get(`/jobs/${jobId}`);
          job.value = response.data;
          
          // Check if user has already applied
          const checkApplicationResponse = await apiClient.get(`/applications/check/${jobId}`);
          if (checkApplicationResponse.data.hasApplied) {
            error.value = 'You have already applied for this job';
          }
          
          loading.value = false;
        } catch (err) {
          console.error('Error fetching job details:', err);
          error.value = 'Failed to load job details. Please try again later.';
          loading.value = false;
        }
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
      
      // Handle file upload
      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        
        if (file) {
          // Check file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Maximum size is 5MB.');
            resumeInput.value.value = '';
            return;
          }
          
          // Check file type
          const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload a PDF or Word document.');
            resumeInput.value.value = '';
            return;
          }
          
          formData.resumeFile = file;
        }
      };
      
      // Remove uploaded file
      const removeFile = () => {
        formData.resumeFile = null;
        if (resumeInput.value) {
          resumeInput.value.value = '';
        }
      };
      
      // Validate form
      const validateForm = () => {
        let isValid = true;
        
        // Reset errors
        validationErrors.coverLetter = '';
        validationErrors.confirmed = '';
        
        // Validate cover letter
        if (!formData.coverLetter.trim()) {
          validationErrors.coverLetter = 'Cover letter is required';
          isValid = false;
        } else if (formData.coverLetter.length < 50) {
          validationErrors.coverLetter = 'Cover letter should be at least 50 characters';
          isValid = false;
        }
        
        // Validate confirmation
        if (!formData.confirmed) {
          validationErrors.confirmed = 'You must confirm that your information is accurate';
          isValid = false;
        }
        
        return isValid;
      };
      
      // Submit application
      const submitApplication = async () => {
        if (!validateForm()) return;
        
        try {
          submitting.value = true;
          
          // Create form data for file upload
          const applicationData = new FormData();
          applicationData.append('jobId', jobId);
          applicationData.append('coverLetter', formData.coverLetter);
          applicationData.append('additionalNotes', formData.additionalNotes || '');
          
          if (formData.resumeFile) {
            applicationData.append('resume', formData.resumeFile);
          }
          
          // Submit application
          const response = await apiClient.post('/applications/apply', applicationData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (response.status === 201) {
            // Show success message
            applicationSubmitted.value = true;
          }
        } catch (err) {
          console.error('Error submitting application:', err);
          error.value = 'Failed to submit application. Please try again later.';
        } finally {
          submitting.value = false;
        }
      };
      
      // Navigation functions
      const goBack = () => {
        router.go(-1);
      };
      
      const goToDashboard = () => {
        router.push('/jobseeker-dashboard');
      };
      
      const viewJobDetails = () => {
        router.push(`/job-details/${jobId}`);
      };
      
      // Fetch job data on mount
      onMounted(() => {
        fetchJobDetails();
      });
      
      return {
        job,
        loading,
        error,
        formData,
        validationErrors,
        submitting,
        applicationSubmitted,
        resumeInput,
        formatSalaryPeriod,
        formatEmploymentType,
        handleFileUpload,
        removeFile,
        validateForm,
        submitApplication,
        goBack,
        goToDashboard,
        viewJobDetails
      };
    }
  };
  </script>
  
  <style scoped>
  .apply-job-container {
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
  
  /* Loading, Error and Success States */
  .loading-indicator, .error-message, .success-message {
    text-align: center;
    padding: 40px 0;
  }
  
  .loading-indicator {
    color: #6c757d;
  }
  
  .error-message {
    color: #dc3545;
  }
  
  .success-message {
    color: #28a745;
  }
  
  .success-message h2 {
    color: #28a745;
    margin-bottom: 15px;
  }
  
  .success-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 25px;
  }
  
  /* Job Summary */
  .job-summary {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 25px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .job-title {
    font-size: 22px;
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
  
  .job-details {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .job-location, .job-salary, .job-type {
    font-size: 14px;
    color: #6c757d;
  }
  
  /* Application Form */
  .section-title {
    font-size: 20px;
    color: #2c3e50;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #495057;
  }
  
  .required {
    color: #dc3545;
  }
  
  .form-control {
    width: 100%;
    padding: 10px 12px;
    font-size: 16px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    transition: border-color 0.2s;
    resize: vertical;
  }
  
  .form-control:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  .error-input {
    border-color: #dc3545;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }
  
  /* File Upload */
  .resume-upload {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  
  .file-input {
    display: none;
  }
  
  .upload-btn {
    display: inline-block;
    padding: 8px 15px;
    background-color: #e9ecef;
    color: #495057;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
    font-weight: normal;
  }
  
  .upload-btn:hover {
    background-color: #dee2e6;
  }
  
  .file-name {
    font-size: 14px;
    color: #495057;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  
  .remove-file-btn {
    padding: 5px 10px;
    background-color: #f8d7da;
    color: #dc3545;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .file-formats {
    font-size: 12px;
    color: #6c757d;
    margin-top: 5px;
  }
  
  /* Confirmation Checkbox */
  .confirmation-check {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .confirmation-check input[type="checkbox"] {
    margin-top: 2px;
  }
  
  .confirmation-check label {
    margin-bottom: 0;
    font-weight: normal;
  }
  
  /* Form Actions */
  .form-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
  }
  
  .back-btn, .submit-btn, .primary-btn, .secondary-btn {
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  
  .back-btn {
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ced4da;
  }
  
  .back-btn:hover {
    background-color: #e9ecef;
  }
  
  .submit-btn, .primary-btn {
    background-color: #4CAF50;
    color: white;
    flex-grow: 1;
  }
  
  .submit-btn:hover, .primary-btn:hover {
    background-color: #45a049;
  }
  
  .submit-btn:disabled {
    background-color: #a5d6a7;
    cursor: not-allowed;
  }
  
  .secondary-btn {
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ced4da;
  }
  
  .secondary-btn:hover {
    background-color: #e9ecef;
  }
  
  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .success-actions {
      flex-direction: column;
    }
    
    .job-details {
      flex-direction: column;
      gap: 10px;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .resume-upload {
      flex-wrap: wrap;
    }
    
    .file-name {
      max-width: 100%;
      width: 100%;
      margin-top: 5px;
    }
  }
  </style>