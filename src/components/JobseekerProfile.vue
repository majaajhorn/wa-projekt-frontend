<template>
    <div class="profile-container">
      <div v-if="loading" class="loading-state">
        <p>Loading profile...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchUserProfile" class="retry-btn">Try Again</button>
      </div>
      
      <div v-else class="profile-content">
        <div class="profile-header">
          <div class="profile-image-container">
            <img 
              v-if="jobseeker.profilePicture" 
              :src="jobseeker.profilePicture" 
              alt="Profile"
              class="profile-image"
            />
            <div v-else class="profile-image-placeholder">
              {{ jobseeker.fullName ? jobseeker.fullName.charAt(0).toUpperCase() : 'U' }}
            </div>
          </div>
          
          <div class="profile-info">
            <h1 class="profile-name">{{ jobseeker.fullName }}</h1>
            
            <div class="profile-rating" v-if="averageRating > 0">
              <div class="rating-stars">
                <template v-for="i in 5" :key="i">
                  <span 
                    class="star"
                    :class="{
                      'filled': i <= Math.floor(averageRating), 
                      'half-filled': (i - 0.5) === Math.floor(averageRating * 2) / 2
                    }"
                  >★</span>
                </template>
              </div>
              <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
              <span class="rating-count">({{ reviewCount }} review{{ reviewCount !== 1 ? 's' : '' }})</span>
            </div>
            
            <div class="profile-contact">
              <p v-if="jobseeker.email" class="contact-item">
                <span class="icon">✉️</span> {{ jobseeker.email }}
              </p>
              <p v-if="jobseeker.profileData?.phone" class="contact-item">
                <span class="icon">📞</span> {{ jobseeker.profileData.phone }}
              </p>
              <p v-if="jobseeker.profileData?.location" class="contact-item">
                <span class="icon">📍</span> {{ jobseeker.profileData.location }}
              </p>
            </div>
          </div>
          
          <div class="profile-actions" v-if="!isOwnProfile && isEmployer">
            <button 
              @click="showReviewModal = true" 
              class="review-btn"
              :disabled="hasReviewed"
            >
              {{ hasReviewed ? 'Already Reviewed' : 'Leave Review' }}
            </button>
          </div>
        </div>
        
        <div class="profile-body">
            <div class="profile-section">
                <h2 class="section-title">About Me</h2>
                <div class="section-content">
                    <p v-if="jobseeker.profileData?.aboutYourself">{{ jobseeker.profileData.aboutYourself }}</p>
                    <p v-else class="empty-info">No bio available</p>
                </div>
            </div>
          
          <div class="profile-section" v-if="jobseeker.profileData?.skills?.length > 0">
            <h2 class="section-title">Skills</h2>
            <div class="section-content">
              <div class="skills-list">
                <span 
                  v-for="skill in jobseeker.profileData.skills" 
                  :key="skill" 
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="profile-section" v-if="jobseeker.profileData?.experience?.length > 0">
            <h2 class="section-title">Work Experience</h2>
            <div class="section-content">
              <div 
                v-for="(exp, index) in jobseeker.profileData.experience" 
                :key="index" 
                class="experience-item"
              >
                <div class="experience-header">
                  <h3 class="experience-title">{{ exp.title }}</h3>
                  <p class="experience-company">{{ exp.company }}</p>
                  <p class="experience-period">{{ exp.startDate }} - {{ exp.endDate || 'Present' }}</p>
                </div>
                <p v-if="exp.description" class="experience-description">{{ exp.description }}</p>
              </div>
            </div>
          </div>
          
          <div class="profile-section" v-if="jobseeker.profileData?.education?.length > 0">
            <h2 class="section-title">Education</h2>
            <div class="section-content">
              <div 
                v-for="(edu, index) in jobseeker.profileData.education" 
                :key="index" 
                class="education-item"
              >
                <div class="education-header">
                  <h3 class="education-degree">{{ edu.degree }}</h3>
                  <p class="education-school">{{ edu.school }}</p>
                  <p class="education-period">{{ edu.startYear }} - {{ edu.endYear || 'Present' }}</p>
                </div>
                <p v-if="edu.description" class="education-description">{{ edu.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Reviews Section -->
          <JobseekerReviews :jobseekerId="jobseekerId" @refresh-rating="fetchReviewStats" />
        </div>
      </div>
      
      <!-- Review Modal -->
      <div v-if="showReviewModal" class="modal-backdrop">
        <div class="modal-content review-modal">
          <div class="modal-header">
            <h3>Review {{ jobseeker.fullName }}</h3>
            <button @click="showReviewModal = false" class="close-btn">&times;</button>
          </div>
          
          <div class="modal-body">
            <ReviewForm 
              :jobseekerId="jobseekerId" 
              @review-submitted="handleReviewSubmitted" 
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import apiClient from '../api/axios.js';
  import { reviewService } from '../services/reviewService';
  import JobseekerReviews from './JobseekerReviews.vue';
  import ReviewForm from './ReviewForm.vue';
  
  export default {
    name: 'JobseekerProfile',
    components: {
      JobseekerReviews,
      ReviewForm
    },
    
    setup() {
      const route = useRoute();
      const jobseekerId = computed(() => route.params.id);
      
      const jobseeker = ref({});
      const loading = ref(true);
      const error = ref(null);
      const showReviewModal = ref(false);
      const hasReviewed = ref(false);
      const averageRating = ref(0);
      const reviewCount = ref(0);
      
      const currentUser = computed(() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          return {};
        }
      });
      
      const isEmployer = computed(() => {
        return currentUser.value.role === 'employer';
      });
      
      const isOwnProfile = computed(() => {
        return currentUser.value.id === jobseekerId.value;
      });
      
      const fetchUserProfile = async () => {
        loading.value = true;
        error.value = null;
        
        try {
          const response = await apiClient.get(`/users/${jobseekerId.value}`);
          jobseeker.value = response.data;
          
          // If the user is an employer, check if they've already reviewed this jobseeker
          if (isEmployer.value && !isOwnProfile.value) {
            checkReviewStatus();
          }
          
          // Get review stats
          fetchReviewStats();
        } catch (err) {
          console.error('Error fetching user profile:', err);
          if (err.response?.status === 404) {
            error.value = 'User not found.';
          } else {
            error.value = 'Failed to load profile. Please try again.';
          }
        } finally {
          loading.value = false;
        }
      };
      
      const checkReviewStatus = async () => {
        try {
          const response = await reviewService.checkIfReviewed(jobseekerId.value);
          hasReviewed.value = response.data.hasReviewed;
        } catch (error) {
          console.error('Error checking review status:', error);
        }
      };
      
      const fetchReviewStats = async () => {
        try {
          const response = await reviewService.getJobseekerReviews(jobseekerId.value);
          averageRating.value = response.data.averageRating || 0;
          reviewCount.value = response.data.reviewCount || 0;
        } catch (error) {
          console.error('Error fetching review stats:', error);
        }
      };
      
      const handleReviewSubmitted = () => {
        showReviewModal.value = false;
        hasReviewed.value = true;
        fetchReviewStats();
      };
      
      onMounted(() => {
        fetchUserProfile();
      });
      
      return {
        jobseekerId,
        jobseeker,
        loading,
        error,
        showReviewModal,
        hasReviewed,
        isEmployer,
        isOwnProfile,
        averageRating,
        reviewCount,
        fetchUserProfile,
        fetchReviewStats,
        handleReviewSubmitted
      };
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
  }
  
  .retry-btn {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    padding: 30px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 30px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .profile-image-container {
    margin-right: 30px;
  }
  
  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .profile-image-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #757575;
    border: 4px solid white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .profile-info {
    flex: 1;
  }
  
  .profile-name {
    font-size: 2rem;
    margin: 0 0 10px 0;
    color: #333;
  }
  
  .profile-rating {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .rating-stars {
    display: flex;
    margin-right: 10px;
  }
  
  .star {
    font-size: 1.3rem;
    color: #d1d1d1;
  }
  
  .star.filled {
    color: #ffc107;
  }
  
  .star.half-filled {
    position: relative;
    color: #d1d1d1;
  }
  
  .star.half-filled::after {
    content: '★';
    position: absolute;
    left: 0;
    top: 0;
    width: 50%;
    overflow: hidden;
    color: #ffc107;
  }
  
  .rating-value {
    font-weight: bold;
    margin-right: 5px;
  }
  
  .rating-count {
    font-size: 0.9rem;
    color: #666;
  }
  
  .profile-contact {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .contact-item {
    margin: 0;
    font-size: 0.95rem;
    color: #555;
  }
  
  .icon {
    margin-right: 5px;
  }
  
  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-left: 20px;
  }
  
  .review-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .review-btn:hover:not(:disabled) {
    background-color: #3d8b40;
  }
  
  .review-btn:disabled {
    background-color: #a5d6a7;
    cursor: not-allowed;
  }
  
  .profile-body {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  
  .profile-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .section-title {
    font-size: 1.4rem;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  
  .empty-info {
    color: #888;
    font-style: italic;
  }
  
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .skill-tag {
    background-color: #e0f7fa;
    color: #00838f;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
  }
  
  .experience-item, .education-item {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .experience-item:last-child, .education-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .experience-title, .education-degree {
    font-size: 1.2rem;
    margin: 0 0 5px 0;
    color: #333;
  }
  
  .experience-company, .education-school {
    font-size: 1rem;
    margin: 0 0 5px 0;
    color: #555;
    font-weight: 500;
  }
  
  .experience-period, .education-period {
    font-size: 0.9rem;
    color: #777;
    margin: 0 0 10px 0;
  }
  
  .experience-description, .education-description {
    color: #555;
    line-height: 1.5;
  }
  
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
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
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
  </style>