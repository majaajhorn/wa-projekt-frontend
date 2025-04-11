// services/reviewService.js
import apiClient from '../api/axios.js';

export const reviewService = {
  // Submit a new review for a jobseeker
  submitReview(jobseekerId, rating, comment, jobId = null) {
    return apiClient.post('/reviews', {
      jobseekerId,
      rating,
      comment,
      jobId
    });
  },
  
  // Check if the employer has already reviewed a specific jobseeker
  checkIfReviewed(jobseekerId) {
    return apiClient.get(`/reviews/check/${jobseekerId}`);
  },
  
  // Get all reviews for a specific jobseeker
  getJobseekerReviews(jobseekerId) {
    return apiClient.get(`/reviews/jobseeker/${jobseekerId}`);
  },
  
  // Get all reviews created by the logged-in employer
  getEmployerReviews() {
    return apiClient.get('/reviews/employer');
  }
};

export default reviewService;