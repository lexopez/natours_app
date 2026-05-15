/* eslint-disable */
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.9.0/+esm';
import { showAlert } from './alerts.js';
const stripe = Stripe(
  'pk_test_51TWyikIOneEzf9p42wozwByD59JjniPYGcznQBQdP2QmwYkGw1ry3UVKdYgTuSyX2h7VbY4tJ229BoSUzdts3LGq00UtTzLuU1',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
