<template>
    <div class="browse-carers-container">
      <div class="header-section">
        <h1 class="page-title">Find the Perfect Carer</h1>
        <p class="subtitle">Browse through qualified and experienced care professionals</p>
      </div>
      
      <!-- Search and Filter Controls -->
      <div class="search-filter-container">
        <div class="search-container">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by name or location..." 
              class="search-input"
              @input="filterCarers"
            />
          </div>
        </div>
        
        <div class="filter-container">
          <div class="filter-group">
            <label class="filter-label">English Level</label>
            <select v-model="filterCriteria.englishLevel" @change="filterCarers" class="filter-select">
              <option value="">All Levels</option>
              <option value="Very Basic">Very Basic</option>
              <option value="Conversational">Conversational</option>
              <option value="Fluent">Fluent</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Live-in Experience</label>
            <select v-model="filterCriteria.liveInExperience" @change="filterCarers" class="filter-select">
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Driving License</label>
            <select v-model="filterCriteria.drivingLicence" @change="filterCarers" class="filter-select">
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <button @click="resetFilters" class="reset-filter-button" v-if="isFiltered">
            <span class="reset-icon">↺</span> Reset
          </button>
        </div>
      </div>
  
      <!-- Results counter -->
      <div class="results-counter" v-if="!loading && !error">
        Found <span class="results-count">{{ filteredCarers.length }}</span> carer{{ filteredCarers.length !== 1 ? 's' : '' }}
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
  
      <!-- Carers Grid -->
      <div v-else class="carers-grid">
        <div v-for="carer in filteredCarers" :key="carer._id" class="carer-card">
          <div class="card-header">
            <div class="carer-image">
              <img 
                :src="carer.profilePicture || defaultProfileImage" 
                alt="Profile picture"
                @error="handleImageError($event)"
              />
            </div>
            <div class="carer-header-info">
              <h2 class="carer-name">{{ carer.fullName }}</h2>
              <p class="carer-location">
                <span class="location-icon">📍</span> 
                {{ carer.profileData?.location || 'Location not specified' }}
              </p>
            </div>
          </div>
          
          <div class="card-body">
            <!-- Key attributes badges -->
            <div class="attribute-badges">
              <span class="badge" v-if="carer.profileData?.englishLevel">
                {{ carer.profileData.englishLevel }} English
              </span>
              <span class="badge" v-if="carer.profileData?.liveInExperience">
                Live-in Experience
              </span>
              <span class="badge" v-if="carer.profileData?.drivingLicence">
                Driver
              </span>
            </div>
            
            <!-- Experience section -->
            <div class="experience-section" v-if="carer.profileData?.liveInExperience">
              <span class="experience-years">{{ formatText(carer.profileData?.liveInExperience) }}</span> of live-in care experience
            </div>
            
            <!-- Qualifications section -->
            <div class="info-section" v-if="carer.profileData?.qualification && carer.profileData.qualification.length > 0">
              <h3 class="section-title">
                <span class="section-icon">🎓</span> Qualifications
              </h3>
              <ul class="info-list">
                <li v-for="(qual, index) in formatText(carer.profileData.qualification)" :key="index">
                  {{ qual }}
                </li>
              </ul>
            </div>
            
            <!-- Care Experience section -->
            <div class="info-section" v-if="carer.profileData?.careExperience && carer.profileData.careExperience.length > 0">
              <h3 class="section-title">
                <span class="section-icon">👩‍⚕️</span> Care Experience
              </h3>
              <ul class="info-list">
                <li v-for="(exp, index) in formatText(carer.profileData.careExperience)" :key="index">
                  {{ exp }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="card-footer">
            <button class="contact-button">
              <span class="contact-icon">✉️</span> Contact Carer
            </button>
            <button class="view-profile-button" @click="showProfile(carer)">View Full Profile</button>
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
                :src="selectedCarer.profilePicture || defaultProfileImage" 
                alt="Profile picture"
                @error="handleImageError($event)"
              />
            </div>
            <div class="profile-titles">
              <h2 class="profile-name">{{ selectedCarer.fullName }}</h2>
              <p class="profile-location">
                <span class="location-icon">📍</span> 
                {{ selectedCarer.profileData?.location || 'Location not specified' }}
              </p>
            </div>
          </div>
          
          <div class="profile-body">
            <!-- Key details section -->
            <div class="profile-section">
              <h3 class="profile-section-title">Key Details</h3>
              <div class="profile-details-grid">
                <div class="profile-detail-item">
                  <div class="detail-label">English Level</div>
                  <div class="detail-value">{{ selectedCarer.profileData?.englishLevel || 'Not specified' }}</div>
                </div>
                <div class="profile-detail-item">
                  <div class="detail-label">Live-in Experience</div>
                  <div class="detail-value">{{ selectedCarer.profileData?.liveInExperience ? formatText(selectedCarer.profileData.liveInExperience) : 'No' }}</div>
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
  import axios from 'axios';
  
  export default {
    name: 'BrowseCarers',
    data() {
      return {
        searchQuery: '',
        carers: [],
        filteredCarers: [],
        loading: true,
        error: null,
        filterCriteria: {
          englishLevel: '',
          liveInExperience: '',
          drivingLicence: ''
        },
        selectedCarer: null,
        defaultProfileImage: '/src/assets/default-profile.png'
      };
    },
    computed: {
      isFiltered() {
        return this.searchQuery !== '' ||
               this.filterCriteria.englishLevel !== '' ||
               this.filterCriteria.liveInExperience !== '' ||
               this.filterCriteria.drivingLicence !== '';
      }
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
          const response = await axios.get('http://localhost:5000/auth/carers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
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
          
          // Filter by English level (case insensitive)
          const englishLevelFilter = this.filterCriteria.englishLevel.toLowerCase();
          const carerEnglishLevel = (carer.profileData?.englishLevel || '').toLowerCase();
          const matchesEnglishLevel = !this.filterCriteria.englishLevel || 
            carerEnglishLevel === englishLevelFilter;
          
          // Filter by live-in experience - convert string 'true'/'false' to boolean
          const liveInFilter = this.filterCriteria.liveInExperience === 'true' ? true : 
                             this.filterCriteria.liveInExperience === 'false' ? false : null;
          const matchesLiveInExp = liveInFilter === null || 
            (this.filterCriteria.liveInExperience === 'true' ? !!carer.profileData?.liveInExperience : !carer.profileData?.liveInExperience);
          
          // Filter by driving licence - special handling for yes/no values from database
          let matchesDrivingLicence = true;
          if (this.filterCriteria.drivingLicence === 'true') {
            // Check for any truthy value or the string "yes"
            const drivingValue = carer.profileData?.drivingLicence;
            console.log(`Carer ${carer.fullName} driving value:`, drivingValue, typeof drivingValue);
            matchesDrivingLicence = drivingValue === true || drivingValue === 'yes' || drivingValue === 'true';
          } else if (this.filterCriteria.drivingLicence === 'false') {
            // Check for any falsy value or the string "no"
            const drivingValue = carer.profileData?.drivingLicence;
            matchesDrivingLicence = drivingValue === false || drivingValue === 'no' || drivingValue === 'false' || !drivingValue;
          }
          
          console.log(`Carer: ${carer.fullName}, Matches driving: ${matchesDrivingLicence}`);
          
          return matchesSearch && matchesEnglishLevel && matchesLiveInExp && matchesDrivingLicence;
        });
        
        console.log('Filtered carers count:', this.filteredCarers.length);
      },
      
      resetFilters() {
        this.searchQuery = '';
        this.filterCriteria.englishLevel = '';
        this.filterCriteria.liveInExperience = '';
        this.filterCriteria.drivingLicence = '';
        this.filteredCarers = [...this.carers];
      },
      
      handleImageError(event) {
        event.target.src = this.defaultProfileImage;
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
      }
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
    padding: 30px 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    background-color: #f9f9fd;
  }
  
  /* Page title */
  .page-title {
    color: #4299e1;
    margin-bottom: 10px;
    font-size: 32px;
    font-weight: 700;
    text-align: center;
  }
  
  .subtitle {
    color: #64748b;
    font-size: 18px;
    margin: 0 0 30px 0;
    text-align: center;
  }
  
  /* Search and Filter Styles */
  .search-filter-container {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .search-container {
    flex: 1;
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    position: absolute;
    left: 15px;
    font-size: 18px;
    color: #a0aec0;
  }
  
  .search-input {
    width: 100%;
    padding: 14px 15px 14px 45px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s;
    background-color: #f8fafc;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    background-color: white;
  }
  
  .filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: flex-end;
  }
  
  .filter-group {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .filter-label {
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
  }
  
  .filter-select {
    padding: 12px 15px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #f8fafc;
    font-size: 16px;
    transition: all 0.3s;
    cursor: pointer;
  }
  
  .filter-select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    background-color: white;
  }
  
  .reset-filter-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background-color: #edf2f7;
    color: #4a5568;
    border: none;
    border-radius: 8px;
    padding: 12px 15px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    align-self: flex-end;
  }
  
  .reset-filter-button:hover {
    background-color: #e2e8f0;
  }
  
  .reset-icon {
    font-size: 16px;
  }
  
  /* Results counter */
  .results-counter {
    margin-bottom: 20px;
    font-size: 16px;
    color: #4a5568;
  }
  
  .results-count {
    font-weight: 700;
    color: #4299e1;
  }
  
  /* Loading, Error, Empty States */
  .loading-container,
  .error-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    text-align: center;
    background-color: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .spinner {
    border: 4px solid rgba(66, 153, 225, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4299e1;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-icon,
  .empty-icon {
    font-size: 40px;
    margin-bottom: 15px;
  }
  
  .retry-button,
  .reset-button {
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 20px;
  }
  
  .retry-button:hover,
  .reset-button:hover {
    background-color: #3182ce;
  }
  
  /* Carers Grid */
  .carers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
  }
  
  .carer-card {
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
  }
  
  .carer-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1);
  }
  
  /* Card Header */
  .card-header {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid #f0f4f8;
  }
  
  .carer-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 3px solid #4299e1;
    background-color: #f0f7ff;
  }
  
  .carer-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .carer-header-info {
    display: flex;
    flex-direction: column;
  }
  
  .carer-name {
    margin: 0 0 5px 0;
    color: #2d3748;
    font-size: 20px;
    font-weight: 600;
  }
  
  .carer-location {
    color: #718096;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
  }
  
  .location-icon {
    color: #4299e1;
  }
  
  /* Card Body */
  .card-body {
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* Attribute Badges */
  .attribute-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 5px;
  }
  
  .badge {
    background-color: #ebf8ff;
    color: #3182ce;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 20px;
  }
  
  /* Experience section */
  .experience-section {
    font-size: 14px;
    color: #4a5568;
  }
  
  .experience-years {
    font-weight: 600;
    color: #2d3748;
  }
  
  /* Info Sections */
  .info-section {
    margin-bottom: 15px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 10px 0;
  }
  
  .section-icon {
    color: #4299e1;
  }
  
  .info-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .info-list li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #4a5568;
  }
  
  .info-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #4299e1;
    font-weight: bold;
  }
  
  /* Card Footer */
  .card-footer {
    padding: 20px;
    display: flex;
    gap: 10px;
    border-top: 1px solid #f0f4f8;
  }
  
  .contact-button {
    flex: 3;
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 12px 0;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .contact-button:hover {
    background-color: #3182ce;
  }
  
  .view-profile-button {
    flex: 2;
    background-color: white;
    color: #4299e1;
    border: 1px solid #4299e1;
    padding: 12px 0;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .view-profile-button:hover {
    background-color: #ebf8ff;
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
    border-radius: 12px;
    max-width: 900px;
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
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    color: #64748b;
    cursor: pointer;
    z-index: 10;
    width: 36px;
    height: 36px;
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
    padding: 30px;
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
  }
  
  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #4299e1;
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
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
  }
  
  .profile-location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    color: #64748b;
    margin: 0;
  }
  
  .profile-body {
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  
  .profile-section {
    margin-bottom: 10px;
  }
  
  .profile-section-title {
    font-size: 20px;
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
    font-weight: 600;
    color: #334155;
  }
  
  .profile-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
  
  .profile-list li {
    padding: 10px 15px;
    background-color: #f8fafc;
    border-radius: 8px;
    color: #334155;
    font-size: 15px;
    position: relative;
    padding-left: 20px;
  }
  
  .profile-list li::before {
    content: '•';
    position: absolute;
    left: 10px;
    color: #4299e1;
    font-weight: bold;
  }
  
  .profile-footer {
    padding: 20px 30px;
    border-top: 1px solid #e2e8f0;
    background-color: #f8fafc;
  }
  
  .contact-button-large {
    width: 100%;
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  .contact-button-large:hover {
    background-color: #3182ce;
  }
  
  @media (max-width: 768px) {
    .search-filter-container {
      padding: 15px;
    }
    
    .filter-container {
      flex-direction: column;
      gap: 15px;
    }
    
    .filter-group {
      width: 100%;
    }
    
    .carers-grid {
      grid-template-columns: 1fr;
    }
    
    .card-footer {
      flex-direction: column;
    }
    
    .profile-header {
      flex-direction: column;
      text-align: center;
      padding: 20px;
    }
    
    .profile-details-grid {
      grid-template-columns: 1fr;
    }
    
    .profile-list {
      grid-template-columns: 1fr;
    }
    
    .profile-body {
      padding: 20px;
    }
  }
  </style>