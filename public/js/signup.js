/* eslint-disable */
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.9.0/+esm';
import { showAlert } from './alerts.js';

export const signup = async (name, email, password, passwordConfirm) => {
    console.log(name, email, password, passwordConfirm);

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};