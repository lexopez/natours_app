// public/js/manageTours.js
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.9.0/+esm';
import { showAlert } from './alerts.js';

// public/js/manageTours.js
export const adminManageTour = async (method, url, data) => {
  try {
    const res = await axios({
      method,
      url,
      data,
      headers: {
        // Essential configuration override required for Multer processing boundaries:
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.status === 200 || res.status === 201) {
      showAlert('success', 'Tour updated successfully!');
      window.setTimeout(() => location.reload(true), 1500);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error saving changes.');
  }
};

export const adminDeleteTour = async (tourId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`
    });

    showAlert('success', 'Tour successfully removed from database.');
    window.setTimeout(() => location.reload(true), 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error deleting this tour.');
  }
};