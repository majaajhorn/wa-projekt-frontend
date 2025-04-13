<template>
    <div class="jobseeker-reviews-section">
      <h2 class="section-title">Reviews & Ratings</h2>
      
      <div v-if="isEmployer && !isOwnProfile">
        <ReviewForm 
          :jobseekerId="jobseekerId" 
          @review-submitted="handleReviewSubmitted" 
        />
      </div>
      
      <ReviewList :jobseekerId="jobseekerId" ref="reviewListRef" />
    </div>
  </template>
  
<script>
  import { ref, computed } from 'vue';
  import ReviewForm from './ReviewForm.vue';
  import ReviewList from './ReviewList.vue';
  
  export default {
    name: 'JobseekerReviews',
    components: {
      ReviewForm,
      ReviewList
    },
    props: {
      jobseekerId: {
        type: String,
        required: true
      }
    },
    
    setup(props) {
      const reviewListRef = ref(null);
  
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
        return currentUser.value.id === props.jobseekerId;
      });
      
      const handleReviewSubmitted = () => {
        // Refresh the review list when a new review is submitted
        if (reviewListRef.value) {
          reviewListRef.value.fetchReviews();
        }
      };
      
      return {
        reviewListRef,
        isEmployer,
        isOwnProfile,
        handleReviewSubmitted
      };
    }
  };
  </script>
  
<style scoped>
  .jobseeker-reviews-section {
    margin: 30px 0;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  </style>