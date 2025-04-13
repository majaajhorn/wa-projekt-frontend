<template>
    <div class="review-form-container">
      <h3 class="review-form-title">Rate This Jobseeker</h3>
      
      <div v-if="alreadyReviewed" class="review-message">
        <p>You have already reviewed this jobseeker.</p>
      </div>
      
      <div v-else>
        <form @submit.prevent="submitReview" class="review-form">
          <div class="rating-container">
            <label class="rating-label">Rating:</label>
            <div class="star-rating">
              <template v-for="star in 5" :key="star">
                <span 
                  class="star" 
                  :class="{ 'filled': star <= rating }"
                  @click="setRating(star)"
                >
                  ★
                </span>
              </template>
            </div>
            <small class="rating-text">{{ ratingText }}</small>
          </div>
          
          <div class="form-group">
            <label for="comment">Comment (optional):</label>
            <textarea 
              id="comment" 
              v-model="comment" 
              class="form-control" 
              placeholder="Share your experience working with this jobseeker..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn" 
              :disabled="isSubmitting || rating === 0"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </form>
      </div>
    </div>
</template>
  
<script>
  import { ref, computed, onMounted } from 'vue';
  import { reviewService } from '../services/reviewService';
  
  export default {
    name: 'ReviewForm',
    props: {
      jobseekerId: {
        type: String,
        required: true
      },
      jobId: {
        type: String,
        default: null
      }
    },
    
    setup(props, { emit }) {
      const rating = ref(0);
      const comment = ref('');
      const isSubmitting = ref(false);
      const alreadyReviewed = ref(false);
      
      const ratingText = computed(() => {
        const texts = [
          '',
          'Poor',
          'Fair',
          'Good',
          'Very Good',
          'Excellent'
        ];
        return texts[rating.value] || '';
      });
      
      const setRating = (value) => {
        rating.value = value;
      };
      
      const submitReview = async () => {
        if (rating.value === 0) return;
        
        isSubmitting.value = true;
        
        try {
          const response = await reviewService.submitReview(
            props.jobseekerId,
            rating.value,
            comment.value,
            props.jobId
          );
          
          emit('review-submitted', response.data.review);
          alreadyReviewed.value = true;
        } catch (error) {
          console.error('Error submitting review:', error);
          
          // Check if error is because user already reviewed
          if (error.response?.data?.message?.includes('already reviewed')) {
            alreadyReviewed.value = true;
          } else {
            alert('Failed to submit review. Please try again.');
          }
        } finally {
          isSubmitting.value = false;
        }
      };
      
      // Check if the employer has already reviewed this jobseeker
      const checkReviewStatus = async () => {
        try {
          const response = await reviewService.checkIfReviewed(props.jobseekerId);
          alreadyReviewed.value = response.data.hasReviewed;
        } catch (error) {
          console.error('Error checking review status:', error);
        }
      };
      
      onMounted(() => {
        checkReviewStatus();
      });
      
      return {
        rating,
        comment,
        isSubmitting,
        alreadyReviewed,
        ratingText,
        setRating,
        submitReview
      };
    }
  };
  </script>
  
<style scoped>
  .review-form-container {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .review-form-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: #333;
  }
  
  .review-message {
    text-align: center;
    padding: 15px;
    background-color: #e8f5e9;
    border-radius: 4px;
  }
  
  .review-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .rating-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .rating-label {
    font-weight: 500;
  }
  
  .star-rating {
    display: flex;
    gap: 5px;
  }
  
  .star {
    font-size: 2rem;
    color: #d1d1d1;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .star:hover {
    color: #ffc107;
  }
  
  .star.filled {
    color: #ffc107;
  }
  
  .rating-text {
    font-size: 0.9rem;
    color: #555;
    margin-top: 5px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group label {
    font-weight: 500;
  }
  
  .form-control {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
  
  .submit-btn {
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .submit-btn:hover:not(:disabled) {
    background-color: #007ce2;
  }
  
  .submit-btn:disabled {
    background-color: #93ceff;
    cursor: not-allowed;
  }
  </style>