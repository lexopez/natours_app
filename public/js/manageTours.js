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
      const msg =
        mode === 'create'
          ? 'Tour created successfully!'
          : 'Tour updated successfully!';
      showAlert('success', msg);

      // Return the created/updated tour data (needed for follow-up image upload)
      return res.data.data.data;
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error saving changes.');
    return null;
  }
};

// Separate image uploader — uses FormData/multipart for file upload
export const uploadTourImage = async (tourId, imageFile) => {
  try {
    const form = new FormData();
    form.append('imageCover', imageFile);

    await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}`,
      data: form,
    });
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error uploading image.');
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