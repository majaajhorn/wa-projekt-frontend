<template>
  <div class="browse-carers-container">
    <!-- Page Title -->
    <h1 class="page-title">Find the Perfect Carer</h1>
    <p class="subtitle">Browse through qualified and experienced care professionals</p>
    
    <div class="search-results-layout">
      <!-- Left Column - Filters -->
      <div class="filters-column">
        <div class="search-box">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by name or location" 
              class="search-input"
              @input="filterCarers"
            />
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Gender</h3>
          <div class="filter-buttons">
            <button 
              @click="toggleGenderFilter('any')" 
              :class="['filter-btn', genderFilter === 'any' ? 'active' : '']">
              Any
            </button>
            <button 
              @click="toggleGenderFilter('male')" 
              :class="['filter-btn', genderFilter === 'male' ? 'active' : '']">
              Male
            </button>
            <button 
              @click="toggleGenderFilter('female')" 
              :class="['filter-btn', genderFilter === 'female' ? 'active' : '']">
              Female
            </button>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Live-in Care Experience</h3>
          <div class="checkbox-filters">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.lessOneYear" @change="filterCarers">
              <span class="custom-checkbox"></span>
              Less than a year
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.oneToThreeYears" @change="filterCarers">
              <span class="custom-checkbox"></span>
              1-3 years
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.fourToSixYears" @change="filterCarers">
              <span class="custom-checkbox"></span>
              4-6 years
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.moreThanSixYears" @change="filterCarers">
              <span class="custom-checkbox"></span>
              More than 6 years
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">English Language Level</h3>
          <div class="checkbox-filters">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.veryBasicEnglish" @change="filterCarers">
              <span class="custom-checkbox"></span>
              Very Basic
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.conversationalEnglish" @change="filterCarers">
              <span class="custom-checkbox"></span>
              Conversational
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterCriteria.fluentEnglish" @change="filterCarers">
              <span class="custom-checkbox"></span>
              Fluent
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-heading">Driving License</h3>
          <div class="radio-filters">
            <label class="radio-label">
              <input type="radio" name="drivingLicense" v-model="filterCriteria.drivingLicence" value="" @change="filterCarers">
              <span class="custom-radio"></span>
              Any
            </label>
            <label class="radio-label">
              <input type="radio" name="drivingLicense" v-model="filterCriteria.drivingLicence" value="true" @change="filterCarers">
              <span class="custom-radio"></span>
              Yes
            </label>
            <label class="radio-label">
              <input type="radio" name="drivingLicense" v-model="filterCriteria.drivingLicence" value="false" @change="filterCarers">
              <span class="custom-radio"></span>
              No
            </label>
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
              @input="filterCarers"
            />
          </div>
        </div>
      </div>
      
      <!-- Right Column - Results -->
      <div class="results-column">
        <!-- Results Count -->
        <div class="results-header">
          <div class="results-count">
            <span>Your search criteria returned </span>
            <span class="count-highlight">{{ filteredCarers.length }}</span>
            <span> {{ filteredCarers.length === 1 ? 'result' : 'results' }}.</span>
          </div>
          <div class="results-sort">
            <span>The most recent profiles are listed first.</span>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Searching for carers...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button @click="fetchCarers" class="retry-button">Try Again</button>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredCarers.length === 0" class="empty-container">
          <div class="empty-icon">🔍</div>
          <h3>No Carers Found</h3>
          <p>We couldn't find any carers matching your search criteria.</p>
          <button @click="resetFilters" class="reset-button">Reset All Filters</button>
        </div>
        
        <!-- Carer List -->
        <div v-else class="carer-list">
          <div v-for="carer in filteredCarers" :key="carer._id" class="carer-card">
            <div class="carer-card-content">
              <div class="carer-info-section">
                <h3 class="carer-name">{{ carer.fullName }}</h3>

                <!-- Display actual care skills as tags -->
                <div class="carer-skills">
                  <span v-if="hasExperience(carer, 'brain_injury')" class="skill-tag">Brain Injury</span>
                  <span v-if="hasExperience(carer, 'catheter_care')" class="skill-tag">Catheter Care</span>
                  <span v-if="hasExperience(carer, 'complex_care')" class="skill-tag">Complex Care</span>
                  <span v-if="hasExperience(carer, 'dementia')" class="skill-tag">Dementia</span>
                  <span v-if="hasExperience(carer, 'end_of_life')" class="skill-tag">End of life / Palliative Care</span>
                  <span v-if="hasExperience(carer, 'epilepsy')" class="skill-tag">Epilepsy / Partial metabolism</span>
                  <span v-if="hasExperience(carer, 'stroke_recovery')" class="skill-tag">Stroke Recovery</span>
                  <span v-if="hasExperience(carer, 'young_people')" class="skill-tag">Children / Young People</span>
                  <span v-if="hasExperience(carer, 'cancer')" class="skill-tag">Cancer</span>
                </div>

                <!-- Add About section -->
                <div v-if="carer.profileData?.aboutYourself" class="carer-about">
                  <p>{{ carer.profileData.aboutYourself }}</p>
                </div>
                
                <!-- Keep existing description if needed -->
                <div class="carer-description" v-if="carer.profileData?.description">
                  <p>{{ carer.profileData.description }}</p>
                </div>
                
                <div class="carer-meta">
                  <div class="meta-item">
                    <span class="years-icon">⏱️</span>
                    <span>{{ formatText(carer.profileData?.liveInExperience) || 'No experience' }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="gender-icon">{{ carer.profileData?.gender === 'male' ? '👨' : '👩' }}</span>
                    <span>{{ capitalize(carer.profileData?.gender) || 'Not specified' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="carer-profile-section">
                <div class="carer-image">
                  <img 
                    v-if="carer.profilePicture" 
                    :src="carer.profilePicture" 
                    alt="Profile picture"
                    @error="handleImageError($event, carer)"
                  />
                  <div v-else class="profile-initials">
                    {{ getInitials(carer.fullName) }}
                  </div>
                </div>
                <button class="view-profile-btn" @click="showProfile(carer)">View profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Profile Modal -->
<div v-if="selectedCarer" class="profile-modal-overlay" @click="closeProfile">
  <div class="profile-modal-content" @click.stop>
    <button class="close-modal-button" @click="closeProfile">✕</button>
    
    <div class="profile-header">
      <div class="profile-image">
        <img 
          v-if="selectedCarer.profilePicture" 
          :src="selectedCarer.profilePicture" 
          alt="Profile picture"
          @error="handleImageError($event, selectedCarer)"
        />
        <div v-else class="profile-initials">
          {{ getInitials(selectedCarer.fullName) }}
        </div>
      </div>
      <div class="profile-titles">
        <h2 class="profile-name">{{ selectedCarer.fullName }}</h2>
        <p class="profile-location">
          <span class="location-icon">📍</span> 
          {{ selectedCarer.profileData?.location || 'Location not specified' }}
        </p>
        <p class="profile-email">
          <span class="email-icon">✉️</span> 
          {{ selectedCarer.email }}
        </p>
      </div>
    </div>
    
    <div class="profile-body">
      <!-- About section -->
      <div class="profile-section" v-if="selectedCarer.profileData?.aboutYourself">
        <h3 class="profile-section-title">About</h3>
        <p class="profile-about">{{ selectedCarer.profileData.aboutYourself }}</p>
      </div>
      
      <!-- Description section if available -->
      <div class="profile-section" v-if="selectedCarer.profileData?.description">
        <p class="profile-description">{{ selectedCarer.profileData.description }}</p>
      </div>
    
      <!-- Key details section -->
      <div class="profile-section">
        <h3 class="profile-section-title">Key Details</h3>
        <div class="profile-details-grid">
          <div class="profile-detail-item">
            <div class="detail-label">English Level</div>
            <div class="detail-value">{{ formatText(selectedCarer.profileData?.englishLevel) || 'Not specified' }}</div>
          </div>
          <div class="profile-detail-item">
            <div class="detail-label">Live-in Experience</div>
            <div class="detail-value">{{ formatText(selectedCarer.profileData?.liveInExperience) || 'No' }}</div>
          </div>
          <div class="profile-detail-item">
            <div class="detail-label">Driving License</div>
            <div class="detail-value">{{ selectedCarer.profileData?.drivingLicence ? 'Yes' : 'No' }}</div>
          </div>
          <div class="profile-detail-item">
            <div class="detail-label">Gender</div>
            <div class="detail-value">{{ capitalize(selectedCarer.profileData?.gender) || 'Not specified' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Qualifications section -->
      <div class="profile-section" v-if="selectedCarer.profileData?.qualification && selectedCarer.profileData.qualification.length > 0">
        <h3 class="profile-section-title">Qualifications</h3>
        <ul class="profile-list">
          <li v-for="(qual, index) in formatText(selectedCarer.profileData.qualification)" :key="index">
            {{ qual }}
          </li>
        </ul>
      </div>
      
      <!-- Care Experience section -->
      <div class="profile-section" v-if="selectedCarer.profileData?.careExperience && selectedCarer.profileData.careExperience.length > 0">
        <h3 class="profile-section-title">Care Experience</h3>
        <ul class="profile-list">
          <li v-for="(exp, index) in formatText(selectedCarer.profileData.careExperience)" :key="index">
            {{ exp }}
          </li>
        </ul>
      </div>
    </div>
    
    <div class="profile-footer">
      <button class="contact-button-large">
        <span class="contact-icon">✉️</span> Contact {{ selectedCarer.fullName.split(' ')[0] }}
      </button>
    </div>
  </div>
  </div>
  </div>
</template>

<script>
import apiClient from '../api/axios';

export default {
  name: 'BrowseCarers',
  data() {
    return {
      searchQuery: '',
      carers: [],
      filteredCarers: [],
      loading: true,
      error: null,
      genderFilter: 'any',
      filterCriteria: {
        lessOneYear: false,
        oneToThreeYears: false,
        fourToSixYears: false,
        moreThanSixYears: false,
        veryBasicEnglish: false,
        conversationalEnglish: false,
        fluentEnglish: false,
        drivingLicence: '',
        location: '',
      },
      selectedCarer: null,
      defaultProfileImage: '/src/assets/default-profile.png'
    };
  },
  methods: {
    async fetchCarers() {
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
        const response = await apiClient.get('/auth/carers');
        
        console.log('API Response:', response.data);
        
        // Log the first user to check data structure
        if (response.data.length > 0) {
          console.log('First user data structure:', response.data[0]);
          console.log('Driving license type:', typeof response.data[0]?.profileData?.drivingLicence);
          console.log('Driving license value:', response.data[0]?.profileData?.drivingLicence);
        }
        
        this.carers = response.data;
        this.filteredCarers = [...this.carers];
        this.loading = false;
      } catch (err) {
        console.error('Error fetching carers:', err);
        this.error = 'Failed to load carers. Please try again later.';
        this.loading = false;
      }
    },
    
    filterCarers() {
      console.log('Filtering carers with search query:', this.searchQuery);
      console.log('Filter criteria:', this.filterCriteria);
      
      this.filteredCarers = this.carers.filter(carer => {
        // Search by name or location (case insensitive)
        const searchTerm = this.searchQuery.toLowerCase().trim();
        const carerName = (carer.fullName || '').toLowerCase();
        const carerLocation = (carer.profileData?.location || '').toLowerCase();
        
        // Check if search term is found in name or location
        const matchesSearch = this.searchQuery === '' || 
          carerName.includes(searchTerm) || 
          carerLocation.includes(searchTerm);
        
        // Gender filter
        const matchesGender = this.genderFilter === 'any' || 
          carer.profileData?.gender === this.genderFilter;
        
        // Years of experience filter
        let matchesExperience = true;
        if (this.filterCriteria.lessOneYear || this.filterCriteria.oneToThreeYears || 
            this.filterCriteria.fourToSixYears || this.filterCriteria.moreThanSixYears) {
          matchesExperience = false;
          const exp = carer.profileData?.liveInExperience || '';
          
          if (this.filterCriteria.lessOneYear && 
              (exp.includes('less_than_a_year') || exp === '')) {
            matchesExperience = true;
          }
          if (this.filterCriteria.oneToThreeYears && 
              exp.includes('1_to_3_years')) {
            matchesExperience = true;
          }
          if (this.filterCriteria.fourToSixYears && 
              exp.includes('4_to_6_years')) {
            matchesExperience = true;
          }
          if (this.filterCriteria.moreThanSixYears && 
              exp.includes('more_than_6_years')) {
            matchesExperience = true;
          }
        }
        
        // English level filter
        let matchesEnglish = true;
        if (this.filterCriteria.veryBasicEnglish || this.filterCriteria.conversationalEnglish || 
            this.filterCriteria.fluentEnglish) {
          matchesEnglish = false;
          const level = (carer.profileData?.englishLevel || '').toLowerCase();
          
          if (this.filterCriteria.veryBasicEnglish && 
              (level.includes('basic') || level.includes('very_basic'))) {
            matchesEnglish = true;
          }
          if (this.filterCriteria.conversationalEnglish && 
              level.includes('conversational')) {
            matchesEnglish = true;
          }
          if (this.filterCriteria.fluentEnglish && 
              level.includes('fluent')) {
            matchesEnglish = true;
          }
        }
        
        // Driving licence filter
        let matchesDrivingLicence = true;
        if (this.filterCriteria.drivingLicence) {
          const drivingValue = carer.profileData?.drivingLicence;
          if (this.filterCriteria.drivingLicence === 'true') {
            matchesDrivingLicence = drivingValue === true || drivingValue === 'yes' || drivingValue === 'true';
          } else if (this.filterCriteria.drivingLicence === 'false') {
            matchesDrivingLicence = drivingValue === false || drivingValue === 'no' || drivingValue === 'false' || !drivingValue;
          }
        }
        
        // Location filter - now uses text input for partial matches
        const matchesLocation = !this.filterCriteria.location || 
          (carer.profileData?.location || '').toLowerCase().includes(this.filterCriteria.location.toLowerCase());
        
        return matchesSearch && matchesGender && matchesExperience && 
               matchesEnglish && matchesDrivingLicence && matchesLocation;
      });
      
      console.log('Filtered carers count:', this.filteredCarers.length);
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.genderFilter = 'any';
      
      // Reset all checkbox filters
      Object.keys(this.filterCriteria).forEach(key => {
        if (typeof this.filterCriteria[key] === 'boolean') {
          this.filterCriteria[key] = false;
        } else {
          this.filterCriteria[key] = '';
        }
      });
      
      this.filteredCarers = [...this.carers];
    },
    
    toggleGenderFilter(gender) {
      this.genderFilter = gender;
      this.filterCarers();
    },
    
    handleImageError(event, carer) {
    // Instead of replacing with default image, we'll use v-if/v-else with initials
    if (carer) {
      carer.profilePicture = null; // Setting to null will trigger the v-else condition
    } else {
      event.target.style.display = 'none'; // Fallback if carer object is not provided
      }
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
    
    capitalize(text) {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    
    showProfile(carer) {
      console.log('Showing profile for:', carer.fullName);
      this.selectedCarer = carer;
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    },
    
    closeProfile() {
      this.selectedCarer = null;
      document.body.style.overflow = ''; // Re-enable scrolling
    },
    
    // Helper method to check if carer has specific experience or qualification
    hasExperience(carer, skill) {
      if (!carer.profileData) return false;
      
      // Check in careExperience array
      if (Array.isArray(carer.profileData.careExperience)) {
        if (carer.profileData.careExperience.includes(skill)) return true;
      }
      
      // Check in qualification array
      if (Array.isArray(carer.profileData.qualification)) {
        if (carer.profileData.qualification.includes(skill)) return true;
      }
      
      return false;
    },

    getInitials(name) {
      if (!name) return '';
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
  },
  mounted() {
    console.log('BrowseCarers component mounted');
    this.fetchCarers();
  }
};
</script>

<style scoped>
/* Main container */
.browse-carers-container {
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
  text-align: center;
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

/* Filter buttons (for gender) */
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
.profile-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #64748b;
  margin: 8px 0 0 0;
}

.email-icon {
  color: #4299e1;
}

.profile-initials {
  width: 100%;
  height: 100%;
  background-color: #4299e1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
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

/* Carer cards */
.carer-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.carer-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.carer-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transform: translateY(-3px);
}

.carer-card-content {
  display: flex;
  padding: 15px;
}

.carer-info-section {
  flex: 1;
  padding-right: 15px;
}

.carer-name {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  /* Add a bit of ellipsis handling for long names */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.carer-header {
  margin-bottom: 10px;
}

.carer-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.updated-time {
  font-size: 12px;
  color: #888;
  margin-top: 3px;
}

.carer-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.skill-tag {
  padding: 4px 8px;
  background: #f0f9ff;
  color: #3182ce;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.carer-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.carer-description p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;  /* Added standard property for compatibility */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carer-meta {
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

.years-icon,
.gender-icon {
  font-size: 16px;
}

.carer-profile-section {
  flex: 0 0 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.carer-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0f9ff;
}

.carer-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* About section in carer card */
.carer-about {
  margin-bottom: 15px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.carer-about p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* About section in profile modal */
.profile-about {
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  margin: 0;
  white-space: pre-line;
}

.view-profile-btn {
  width: 100%;
  padding: 8px 0;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: center;
}

.view-profile-btn:hover {
  background: #3182ce;
}

/* Profile Modal Styles */
.profile-modal-overlay {
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

.profile-modal-content {
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

.profile-header {
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #4299e1;
  flex-shrink: 0;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-titles {
  flex-grow: 1;
}

.profile-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.profile-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.profile-body {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.profile-description {
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  margin: 0 0 20px 0;
}

.profile-section {
  margin-bottom: 10px;
}

.profile-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.profile-detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-detail-item .detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.profile-detail-item .detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #334155;
}

.profile-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.profile-list li {
  padding: 8px 12px;
  background-color: #f1f5f9;
  border-radius: 6px;
  color: #334155;
  font-size: 14px;
}

.profile-footer {
  padding: 20px 25px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.contact-button-large {
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

.contact-button-large:hover {
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
  
  .carer-card-content {
    flex-direction: column-reverse;
  }
  
  .carer-profile-section {
    flex: 0;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 15px;
    width: 100%;
  }
  
  .carer-image {
    margin-bottom: 0;
  }
  
  .view-profile-btn {
    width: auto;
    padding: 8px 15px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-image {
    margin-bottom: 10px;
  }
  
  .profile-details-grid,
  .profile-list {
    grid-template-columns: 1fr;
  }
}
</style>

