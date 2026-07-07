// public/js/manageTours.js
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.9.0/+esm';
import { showAlert } from './alerts.js';

// Main tour create/update — sends JSON body for nested data structures
export const adminManageTour = async (method, url, data, mode = 'update') => {
  try {
    const res = await axios({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 200 || res.status === 201) {
      // Return the created/updated tour data (needed for follow-up image upload)
      return res.data.data.data;
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error saving changes.');
    return null;
  }
};

// Separate image uploader — uses FormData/multipart for file upload
export const uploadTourImages = async (tourId, imageFiles) => {
  try {
    const form = new FormData();
    if (imageFiles.imageCover) {
      form.append('imageCover', imageFiles.imageCover);
    }
    if (imageFiles.images && imageFiles.images.length > 0) {
      imageFiles.images.forEach((file) => {
        if (file) form.append('images', file);
      });
    }

    if (!form.has('imageCover') && !form.has('images')) return;

    await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}`,
      data: form,
    });
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error uploading images.');
  }
};

export const adminDeleteTour = async (tourId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`,
    });

    showAlert('success', 'Tour successfully removed from database.');
    window.setTimeout(() => location.reload(true), 1500);
  } catch (err) {
    showAlert(
      'error',
      err.response?.data?.message || 'Error deleting this tour.',
    );
  }
};