// public/js/review.js
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.9.0/+esm';
import { showAlert } from './alerts.js';

export const updateReview = async (reviewId, review, rating) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data: {
        review,
        rating,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review updated successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteReview = async (reviewId) => {
  console.log('Deleting review with ID:', reviewId);
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
    });

    // Axios returns a 244 No Content for successful deletes usually
    showAlert('success', 'Review deleted successfully!');
    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const adminDeleteReview = async (reviewId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`
    });

    // Mongoose factory handler returns a 204 status on successful deletion
    showAlert('success', 'Review deleted successfully from database!');
    
    // Refresh page to sync up table visualization
    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Something went wrong while deleting.');
  }
};
