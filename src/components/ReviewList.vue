<template>
    <div class="reviews-container">
      <div class="reviews-header">
        <h3 class="reviews-title">Reviews</h3>
        <div class="reviews-stats">
          <div class="average-rating">
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
            <div class="rating-info">
              <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
              <span class="rating-count">({{ reviewCount }} review{{ reviewCount !== 1 ? 's' : '' }})</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading-state">
        <p>Loading reviews...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchReviews" class="retry-btn">Try Again</button>
      </div>
      
      <div v-else-if="reviews.length === 0" class="empty-state">
        <p>No reviews yet.</p>
      </div>
      
      <div v-else class="reviews-list">
        <div v-for="review in reviews" :key="review._id" class="review-item">
          <div class="review-header">
            <div class="review-author">
              <strong>{{ review.employer?.fullName || 'Anonymous Employer' }}</strong>
              <span v-if="review.employer?.companyName" class="company-name">
                at {{ review.employer.companyName }}
              </span>
            </div>
            <div class="review-rating">
              <template v-for="star in 5" :key="star">
                <span class="star" :class="{ 'filled': star <= review.rating }">★</span>
              </template>
            </div>
          </div>
          
          <div class="review-date">
            {{ formatDate(review.createdAt) }}
          </div>
          
          <div v-if="review.comment" class="review-comment">
            {{ review.comment }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script>
  import { ref, onMounted } from 'vue';
  import { reviewService } from '../services/reviewService';
  
  export default {
    name: 'ReviewList',
    props: {
      jobseekerId: {
        type: String,
        required: true
      }
    },
    
    setup(props) {
      const reviews = ref([]);
      const loading = ref(true);
      const error = ref(null);
      const averageRating = ref(0);
      const reviewCount = ref(0);
      
      const fetchReviews = async () => {
        loading.value = true;
        error.value = null;
        
        try {
          const response = await reviewService.getJobseekerReviews(props.jobseekerId);
          reviews.value = response.data.reviews || [];
          averageRating.value = response.data.averageRating || 0;
          reviewCount.value = response.data.reviewCount || 0;
        } catch (err) {
          console.error('Error fetching reviews:', err);
          error.value = 'Failed to load reviews. Please try again.';
        } finally {
          loading.value = false;
        }
      };
      
      const formatDate = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      };
      
      onMounted(() => {
        fetchReviews();
      });
      
      return {
        reviews,
        loading,
        error,
        averageRating,
        reviewCount,
        fetchReviews,
        formatDate
      };
    }
  };
  </script>
  
<style scoped>
  .reviews-container {
    margin-top: 20px;
  }
  
  .reviews-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .reviews-title {
    font-size: 1.3rem;
    color: #333;
    margin: 0;
  }
  
  .reviews-stats {
    display: flex;
    align-items: center;
  }
  
  .average-rating {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .rating-stars {
    display: flex;
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
  
  .rating-info {
    display: flex;
    flex-direction: column;
  }
  
  .rating-value {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .rating-count {
    font-size: 0.9rem;
    color: #666;
  }
  
  .loading-state, .error-state, .empty-state {
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .retry-btn {
    background-color: #2196f3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .review-item {
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .review-author {
    font-size: 1rem;
  }
  
  .company-name {
    font-size: 0.9rem;
    color: #666;
    margin-left: 5px;
  }
  
  .review-rating .star {
    font-size: 1.1rem;
  }
  
  .review-date {
    font-size: 0.85rem;
    color: #777;
    margin-bottom: 10px;
  }
  
  .review-comment {
    font-size: 0.95rem;
    line-height: 1.5;
    color: #333;
  }
</style>