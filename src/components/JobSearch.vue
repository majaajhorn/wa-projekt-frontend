<template>
  <div class="browse-jobs-container">
    <!-- Page Title -->
    <h1 class="page-title">Find the Perfect Job</h1>
    <p class="subtitle">Browse through available job opportunities</p>
    
    <div class="search-results-layout">
      <!-- Left Column - Filters -->
      <div class="filters-column">
        <div class="search-box">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by title or location" 
              class="search-input"
              @input="filterJobs"
            />
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Job Type</h3>
          <div class="filter-buttons">
            <button 
              @click="toggleJobTypeFilter('any')" 
              :class="['filter-btn', jobTypeFilter === 'any' ? 'active' : '']">
              Any
            </button>
            <button 
              @click="toggleJobTypeFilter('full-time')" 
              :class="['filter-btn', jobTypeFilter === 'full-time' ? 'active' : '']">
              Full-time
            </button>
            <button 
              @click="toggleJobTypeFilter('part-time')" 
              :class="['filter-btn', jobTypeFilter === 'part-time' ? 'active' : '']">
              Part-time
            </button>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Experience Level</h3>
          <div class="checkbox-filters">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.entryLevel" @change="filterJobs">
              <span class="custom-checkbox"></span>
              Entry Level
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.intermediate" @change="filterJobs">
              <span class="custom-checkbox"></span>
              Intermediate
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.expert" @change="filterJobs">
              <span class="custom-checkbox"></span>
              Expert
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Qualifications</h3>
          <div class="checkbox-filters">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.nursingQualification" @change="filterJobs">
              <span class="custom-checkbox"></span>
              Nursing
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.medicalQualification" @change="filterJobs">
              <span class="custom-checkbox"></span>
              Medical/Surgical
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.nvqQualification" @change="filterJobs">
              <span class="custom-checkbox"></span>
              NVQ Health & Social Care
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Driving License Required</h3>
          <div class="radio-filters">
            <label class="radio-label">
              <input type="radio" name="drivingLicense" v-model="filterCriteria.drivingLicense" value="" @change="filterJobs">
              <span class="custom-radio"></span>
              Any
            </label>
            <label class="radio-label">
              <input type="radio" name="drivingLicense" v-model="filterCriteria.drivingLicense" value="true" @change="filterJobs">
              <span class="custom-radio"></span>
              Yes
            </label>
            <label class="radio-label">
              <input type="radio" name="drivingLicense" v-model="filterCriteria.drivingLicense" value="false" @change="filterJobs">
              <span class="custom-radio"></span>
              No
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Salary Range</h3>
          <div class="range-filter">
            <div class="range-inputs">
              <input 
                type="number" 
                v-model="filterCriteria.salaryMin" 
                placeholder="Min" 
                class="filter-input salary-input"
                @input="filterJobs"
              />
              <span>to</span>
              <input 
                type="number" 
                v-model="filterCriteria.salaryMax" 
                placeholder="Max" 
                class="filter-input salary-input"
                @input="filterJobs"
              />
            </div>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Location</h3>
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="filterCriteria.location" 
              placeholder="Enter location..." 
              class="filter-input"
              @input="filterJobs"
            />
          </div>
        </div>
        
        <button @click="resetFilters" class="reset-filters-btn">Reset Filters</button>
      </div>
      
      <!-- Right Column - Results -->
      <div class="results-column">
        <!-- Results Count -->
        <div class="results-header">
          <div class="results-count">
            <span>Your search criteria returned </span>
            <span class="count-highlight">{{ filteredJobs.length }}</span>
            <span> {{ filteredJobs.length === 1 ? 'result' : 'results' }}.</span>
          </div>
          <div class="results-sort">
            <span>The most recent job listings are listed first.</span>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Searching for jobs...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button @click="fetchJobs" class="retry-button">Try Again</button>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredJobs.length === 0" class="empty-container">
          <div class="empty-icon">🔍</div>
          <h3>No Jobs Found</h3>
          <p>We couldn't find any jobs matching your search criteria.</p>
          <button @click="resetFilters" class="reset-button">Reset All Filters</button>
        </div>
        
        <!-- Job List -->
        <div v-else class="job-list">
          <div v-for="job in filteredJobs" :key="job._id" class="job-card">
            <div class="job-card-content">
              <div class="job-info-section">
                <h3 class="job-title">{{ job.title }}</h3>
                
                <div class="job-company">
                  <span>{{ job.company }}</span>
                  <span class="job-location">
                    <span class="location-icon">📍</span> {{ job.location }}
                  </span>
                </div>

                <!-- Display job requirements as tags -->
                <div class="job-requirements">
                  <span v-if="job.jobType" class="requirement-tag">{{ job.jobType }}</span>
                  <span v-if="job.experienceLevel" class="requirement-tag">{{ job.experienceLevel }}</span>
                  <span v-if="job.drivingLicense" class="requirement-tag">Driving License Required</span>
                  <span v-for="(qualification, index) in job.qualifications" :key="index" class="requirement-tag">{{ formatText(qualification) }}</span>
                </div>
                
                <!-- Job Description -->
                <div v-if="job.description" class="job-description">
                  <p>{{ job.description }}</p>
                </div>
                
                <div class="job-meta">
                  <div class="meta-item salary">
                    <span class="salary-icon">💰</span>
                    <span>{{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
                  </div>
                  <div class="meta-item date">
                    <span class="date-icon">📅</span>
                    <span>{{ formatDate(job.createdAt) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="job-action-section">
                <button class="view-job-btn" @click="showJobDetails(job)">View Details</button>
                <button class="apply-btn" @click="applyForJob(job)">Apply Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Job Details Modal -->
    <div v-if="selectedJob" class="job-modal-overlay" @click="closeJobDetails">
      <div class="job-modal-content" @click.stop>
        <button class="close-modal-button" @click="closeJobDetails">✕</button>
        
        <div class="job-modal-header">
          <h2 class="job-modal-title">{{ selectedJob.title }}</h2>
          <div class="job-modal-company">{{ selectedJob.company }}</div>
          <p class="job-modal-location">
            <span class="location-icon">📍</span> 
            {{ selectedJob.location }}
          </p>
        </div>
        
        <div class="job-modal-body">
          <!-- Salary section -->
          <div class="job-modal-section">
            <h3 class="job-modal-section-title">Salary</h3>
            <p class="job-modal-salary">{{ formatSalary(selectedJob.salaryMin, selectedJob.salaryMax) }}</p>
          </div>
          
          <!-- Description section -->
          <div class="job-modal-section">
            <h3 class="job-modal-section-title">Job Description</h3>
            <p class="job-modal-description">{{ selectedJob.description }}</p>
          </div>
        
          <!-- Requirements section -->
          <div class="job-modal-section">
            <h3 class="job-modal-section-title">Requirements</h3>
            <div class="job-modal-requirements">
              <div class="job-modal-detail-item">
                <div class="detail-label">Job Type</div>
                <div class="detail-value">{{ selectedJob.jobType }}</div>
              </div>
              <div class="job-modal-detail-item">
                <div class="detail-label">Experience Level</div>
                <div class="detail-value">{{ selectedJob.experienceLevel }}</div>
              </div>
              <div class="job-modal-detail-item">
                <div class="detail-label">Driving License</div>
                <div class="detail-value">{{ selectedJob.drivingLicense ? 'Required' : 'Not Required' }}</div>
              </div>
            </div>
          </div>
          
          <!-- Qualifications section -->
          <div class="job-modal-section" v-if="selectedJob.qualifications && selectedJob.qualifications.length > 0">
            <h3 class="job-modal-section-title">Qualifications</h3>
            <ul class="job-modal-list">
              <li v-for="(qual, index) in selectedJob.qualifications" :key="index">
                {{ formatText(qual) }}
              </li>
            </ul>
          </div>
          
          <!-- Skills section -->
          <div class="job-modal-section" v-if="selectedJob.skills && selectedJob.skills.length > 0">
            <h3 class="job-modal-section-title">Skills</h3>
            <ul class="job-modal-list">
              <li v-for="(skill, index) in selectedJob.skills" :key="index">
                {{ formatText(skill) }}
              </li>
            </ul>
          </div>
          
          <!-- Contact section -->
          <div class="job-modal-section">
            <h3 class="job-modal-section-title">Contact Information</h3>
            <p class="job-modal-contact">
              <span class="contact-label">Email:</span>
              <span class="contact-value">{{ selectedJob.contactEmail || 'Not provided' }}</span>
            </p>
            <p class="job-modal-contact" v-if="selectedJob.contactPhone">
              <span class="contact-label">Phone:</span>
              <span class="contact-value">{{ selectedJob.contactPhone }}</span>
            </p>
          </div>
        </div>
        
        <div class="job-modal-footer">
          <button class="apply-button-large" @click="applyForJob(selectedJob)">
            <span class="apply-icon">📝</span> Apply for this Position
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '../api/axios';
import { useRouter } from 'vue-router';

export default {
  name: 'JobSearch',
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      searchQuery: '',
      jobs: [],
      filteredJobs: [],
      loading: true,
      error: null,
      jobTypeFilter: 'any',
      filterCriteria: {
        entryLevel: false,
        intermediate: false,
        expert: false,
        nursingQualification: false,
        medicalQualification: false,
        nvqQualification: false,
        drivingLicense: '',
        salaryMin: '',
        salaryMax: '',
        location: '',
      },
      selectedJob: null
    };
  },
  methods: {
    async fetchJobs() {
      this.loading = true;
      this.error = null;
      
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          this.error = 'Authentication required. Please log in.';
          this.loading = false;
          return;
        }
        
        // Fetch data from API
        const response = await apiClient.get('/jobs');
        
        console.log('API Response:', response.data);
        
        // Log the first job to check data structure
        if (response.data.length > 0) {
          console.log('First job data structure:', response.data[0]);
        }
        
        this.jobs = response.data;
        this.filteredJobs = [...this.jobs];
        this.loading = false;
      } catch (err) {
        console.error('Error fetching jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
        this.loading = false;
      }
    },
    
    filterJobs() {
      console.log('Filtering jobs with search query:', this.searchQuery);
      console.log('Filter criteria:', this.filterCriteria);
      
      this.filteredJobs = this.jobs.filter(job => {
        // Search by title or location (case insensitive)
        const searchTerm = this.searchQuery.toLowerCase().trim();
        const jobTitle = (job.title || '').toLowerCase();
        const jobLocation = (job.location || '').toLowerCase();
        const jobCompany = (job.company || '').toLowerCase();
        
        // Check if search term is found in title, location, or company
        const matchesSearch = this.searchQuery === '' || 
          jobTitle.includes(searchTerm) || 
          jobLocation.includes(searchTerm) || 
          jobCompany.includes(searchTerm);
        
        // Job Type filter
        const matchesJobType = this.jobTypeFilter === 'any' || 
          job.jobType === this.jobTypeFilter;
        
        // Experience Level filter
        let matchesExperience = true;
        if (this.filterCriteria.entryLevel || this.filterCriteria.intermediate || 
            this.filterCriteria.expert) {
          matchesExperience = false;
          const exp = job.experienceLevel || '';
          
          if (this.filterCriteria.entryLevel && 
              exp.toLowerCase().includes('entry')) {
            matchesExperience = true;
          }
          if (this.filterCriteria.intermediate && 
              exp.toLowerCase().includes('intermediate')) {
            matchesExperience = true;
          }
          if (this.filterCriteria.expert && 
              exp.toLowerCase().includes('expert')) {
            matchesExperience = true;
          }
        }
        
        // Qualifications filter
        let matchesQualifications = true;
        if (this.filterCriteria.nursingQualification || this.filterCriteria.medicalQualification || 
            this.filterCriteria.nvqQualification) {
          matchesQualifications = false;
          const qualifications = job.qualifications || [];
          
          if (this.filterCriteria.nursingQualification && 
              qualifications.some(q => q.toLowerCase().includes('nursing'))) {
            matchesQualifications = true;
          }
          if (this.filterCriteria.medicalQualification && 
              (qualifications.some(q => q.toLowerCase().includes('medical')) || 
               qualifications.some(q => q.toLowerCase().includes('surgical')))) {
            matchesQualifications = true;
          }
          if (this.filterCriteria.nvqQualification && 
              (qualifications.some(q => q.toLowerCase().includes('nvq')) || 
               qualifications.some(q => q.toLowerCase().includes('health and social care')))) {
            matchesQualifications = true;
          }
        }
        
        // Driving License filter
        let matchesDrivingLicense = true;
        if (this.filterCriteria.drivingLicense) {
          const drivingValue = job.drivingLicense;
          if (this.filterCriteria.drivingLicense === 'true') {
            matchesDrivingLicense = drivingValue === true || drivingValue === 'yes' || drivingValue === 'true';
          } else if (this.filterCriteria.drivingLicense === 'false') {
            matchesDrivingLicense = drivingValue === false || drivingValue === 'no' || drivingValue === 'false' || !drivingValue;
          }
        }
        
        // Salary Range filter
        let matchesSalary = true;
        if (this.filterCriteria.salaryMin && !isNaN(parseInt(this.filterCriteria.salaryMin))) {
          matchesSalary = matchesSalary && job.salaryMax >= parseInt(this.filterCriteria.salaryMin);
        }
        if (this.filterCriteria.salaryMax && !isNaN(parseInt(this.filterCriteria.salaryMax))) {
          matchesSalary = matchesSalary && job.salaryMin <= parseInt(this.filterCriteria.salaryMax);
        }
        
        // Location filter - uses text input for partial matches
        const matchesLocation = !this.filterCriteria.location || 
          (job.location || '').toLowerCase().includes(this.filterCriteria.location.toLowerCase());
        
        return matchesSearch && matchesJobType && matchesExperience && 
               matchesQualifications && matchesDrivingLicense && matchesSalary && matchesLocation;
      });
      
      console.log('Filtered jobs count:', this.filteredJobs.length);
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.jobTypeFilter = 'any';
      
      // Reset all checkbox and other filters
      Object.keys(this.filterCriteria).forEach(key => {
        if (typeof this.filterCriteria[key] === 'boolean') {
          this.filterCriteria[key] = false;
        } else {
          this.filterCriteria[key] = '';
        }
      });
      
      this.filteredJobs = [...this.jobs];
    },
    
    toggleJobTypeFilter(type) {
      this.jobTypeFilter = type;
      this.filterJobs();
    },
    
    formatSalary(min, max) {
      if (!min && !max) return 'Salary not specified';
      if (min && !max) return `£${min.toLocaleString()} and above`;
      if (!min && max) return `Up to £${max.toLocaleString()}`;
      return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Date not available';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    
    formatText(text) {
      if (Array.isArray(text)) {
        return text.map(item => {
          if (typeof item === 'string') {
            return item.replace(/_/g, ' ');
          }
          return item;
        });
      } else if (typeof text === 'string') {
        return text.replace(/_/g, ' ');
      }
      return text;
    },
    
    showJobDetails(job) {
      console.log('Showing details for job:', job.title);
      this.selectedJob = job;
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    },
    
    closeJobDetails() {
      this.selectedJob = null;
      document.body.style.overflow = ''; // Re-enable scrolling
    },
    
    applyForJob(job) {
      // Navigate to the apply job page with the job ID
      this.router.push({ name: 'ApplyJob', params: { id: job._id } });
    }
  },
  mounted() {
    console.log('JobSearch component mounted');
    this.fetchJobs();
  }
};
</script>

<style scoped>
/* Main container */
.browse-jobs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

/* Page title */
.page-title {
  color: #333;
  margin-bottom: 5px;
  font-size: 28px;
  font-weight: 600;
}

.retry-button,
.reset-button {
  margin-top: 15px;
  padding: 8px 20px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.retry-button:hover,
.reset-button:hover {
  background: #3182ce;
}

/* Job cards */
.job-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.job-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transform: translateY(-3px);
}

.job-card-content {
  display: flex;
  padding: 15px;
}

.job-info-section {
  flex: 1;
  padding-right: 15px;
}

.job-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  /* Add a bit of ellipsis handling for long titles */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.job-company {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.job-location {
  display: flex;
  align-items: center;
  gap: 5px;
}

.location-icon {
  color: #4299e1;
}

.job-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.requirement-tag {
  padding: 4px 8px;
  background: #f0f9ff;
  color: #3182ce;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.job-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.job-description p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.salary-icon,
.date-icon {
  font-size: 16px;
}

.job-action-section {
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.view-job-btn,
.apply-btn {
  width: 100%;
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: center;
}

.view-job-btn {
  background: #f0f9ff;
  color: #3182ce;
  border: 1px solid #bee3f8;
}

.view-job-btn:hover {
  background: #e6f7ff;
}

.apply-btn {
  background: #4299e1;
  color: white;
}

.apply-btn:hover {
  background: #3182ce;
}

/* Job Details Modal Styles */
.job-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.job-modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.close-modal-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  z-index: 10;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-modal-button:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.job-modal-header {
  padding: 25px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.job-modal-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.job-modal-company {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 8px;
}

.job-modal-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.job-modal-body {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.job-modal-section {
  margin-bottom: 10px;
}

.job-modal-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.job-modal-salary {
  font-size: 18px;
  font-weight: 500;
  color: #4299e1;
}

.job-modal-description {
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  white-space: pre-line;
}

.job-modal-requirements {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.job-modal-detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #334155;
}

.job-modal-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.job-modal-list li {
  padding: 8px 12px;
  background-color: #f1f5f9;
  border-radius: 6px;
  color: #334155;
  font-size: 14px;
}

.job-modal-contact {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #334155;
}

.contact-label {
  font-weight: 500;
  color: #64748b;
  margin-right: 8px;
}

.job-modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.apply-button-large {
  width: 100%;
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.apply-button-large:hover {
  background-color: #3182ce;
}

/* Responsive styles */
@media (max-width: 768px) {
  .search-results-layout {
    flex-direction: column;
  }
  
  .filters-column {
    position: static;
    width: 100%;
    margin-bottom: 20px;
  }
  
  .job-card-content {
    flex-direction: column;
  }
  
  .job-action-section {
    flex: 0;
    flex-direction: row;
    margin-top: 15px;
  }
  
  .view-job-btn,
  .apply-btn {
    width: auto;
    padding: 8px 15px;
  }
  
  .job-modal-requirements,
  .job-modal-list {
    grid-template-columns: 1fr;
  }
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0 0 30px 0;
  text-align: center;
}

/* Layout */
.search-results-layout {
  display: flex;
  gap: 30px;
}

/* Left column - Filters */
.filters-column {
  flex: 0 0 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 15px;
  align-self: flex-start;
  position: sticky;
  top: 20px;
}

/* Search box */
.search-box {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
}

.search-input, .filter-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  padding-left: 35px;
}

.search-input:focus, .filter-input:focus {
  outline: none;
  border-color: #4299e1;
}

/* Salary inputs */
.range-filter {
  width: 100%;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.salary-input {
  flex: 1;
}

/* Filter sections */
.filter-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.filter-heading {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #444;
}

/* Filter buttons (for job type) */
.filter-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.filter-btn {
  padding: 6px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #e9e9e9;
}

.filter-btn.active {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

/* Checkbox styles */
.checkbox-filters, .radio-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label, .radio-label {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.checkbox-label input, .radio-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox, .custom-radio {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 1px solid #ccc;
}

.custom-checkbox {
  border-radius: 3px;
}

.custom-radio {
  border-radius: 50%;
}

.checkbox-label:hover input ~ .custom-checkbox,
.radio-label:hover input ~ .custom-radio {
  background-color: #f5f5f5;
}

.checkbox-label input:checked ~ .custom-checkbox,
.radio-label input:checked ~ .custom-radio {
  background-color: #4299e1;
  border-color: #4299e1;
}

.custom-checkbox:after,
.custom-radio:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .custom-checkbox:after,
.radio-label input:checked ~ .custom-radio:after {
  display: block;
}

.checkbox-label .custom-checkbox:after {
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.radio-label .custom-radio:after {
  left: 5px;
  top: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

/* Reset filters button */
.reset-filters-btn {
  width: 100%;
  padding: 8px 0;
  background: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: center;
  margin-top: 15px;
}

.reset-filters-btn:hover {
  background: #e9e9e9;
}

/* Right column - Results */
.results-column {
  flex: 1;
}

/* Results header */
.results-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 15px 20px;
  margin-bottom: 20px;
}

.results-count {
  font-size: 15px;
  color: #333;
  margin-bottom: 5px;
}

.count-highlight {
  color: #4299e1;
  font-weight: 600;
}

.results-sort {
  font-size: 13px;
  color: #666;
}

/* Loading, Error, Empty States */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 40px 20px;
  margin-bottom: 20px;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(66, 153, 225, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4299e1;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 30px;
  margin-bottom: 10px;
}

.error-container h3,
.empty-container h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}
</style>