// public/js/manageUsers.js
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.9.0/+esm';
import { showAlert } from './alerts.js';

export const adminUpdateUser = async (userId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User profile updated successfully!');
      window.setTimeout(() => location.reload(true), 1500);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error updating user.');
  }
};

export const adminDeleteUser = async (userId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/users/${userId}`
    });

    showAlert('success', 'User permanently removed from database.');
    window.setTimeout(() => location.reload(true), 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Error deleting user.');
  }
};