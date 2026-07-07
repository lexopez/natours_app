/* eslint-disable */
import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';
import { signup } from './signup.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { showAlert } from './alerts.js';
import { updateReview, deleteReview, adminDeleteReview } from './review.js';
import { adminUpdateUser, adminDeleteUser } from './manageUsers.js';
import { adminManageTour, adminDeleteTour } from './manageTours.js';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

// REVIEW MODAL LOGIC

// DOM Elements
const reviewContainer = document.querySelector('.card');
const editModal = document.querySelector('.edit-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const editForm = document.querySelector('.form--edit-review');
const closeModalBtn = document.querySelector('.btn--close-modal');

let currentReviewId = null;

if (reviewContainer) {
  reviewContainer.addEventListener('click', e => {
    // 1) HANDLE DELETE
    if (e.target.classList.contains('btn--delete-review')) {
      const reviewId = e.target.dataset.reviewId;
      if (confirm('Are you absolutely sure you want to delete this review?')) {
        deleteReview(reviewId);
      }
    }

    // 2) HANDLE EDIT (Open Modal & Populate Values)
    if (e.target.classList.contains('btn--edit-review')) {
      currentReviewId = e.target.dataset.reviewId;
      
      // Grab existing text and ratings directly from the DOM card layout
      const card = e.target.closest('.card');
      const existingText = card.querySelector('.review__text').textContent;
      
      // Find out how many active stars there are
      const existingRating = card.querySelectorAll('.reviews__star--active').length;

      // Fill modal inputs
      document.getElementById('modal-review-text').value = existingText;
      document.getElementById('modal-review-rating').value = existingRating;

      // Show modal
      editModal.classList.remove('hidden');
      modalOverlay.classList.remove('hidden');
    }
  });
}

// Close Modal logic
if (closeModalBtn) {
  const closeModal = () => {
    editModal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
    currentReviewId = null;
  };
  
  closeModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
}

// Form Submission logic
if (editForm) {
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    const reviewText = document.getElementById('modal-review-text').value;
    const reviewRating = document.getElementById('modal-review-rating').value;

    if (currentReviewId) {
      updateReview(currentReviewId, reviewText, reviewRating);
    }
  });
}

// Select the element unique to the Admin panel views
const adminTable = document.querySelector('.admin-table');

if (adminTable) {
  adminTable.addEventListener('click', e => {
    // Check if clicked element or its parent matches our target class
    const deleteBtn = e.target.closest('.btn--admin-delete-review');
    
    if (deleteBtn) {
      e.preventDefault();
      
      // Extract the object ID from the data-review-id attribute
      const reviewId = deleteBtn.dataset.reviewId;
      
      // Confirm before destructive deletion action
      if (confirm('Warning: Are you sure you want to permanently delete this review from the application?')) {
        adminDeleteReview(reviewId);
      }
    }
  });
}

// USER MODAL LOGIC

// const adminTable = document.querySelector('.admin-table');
const userModal = document.querySelector('.user-modal');
const userOverlay = document.querySelector('.user-modal-overlay');
const closeUserModalBtn = document.querySelector('.btn--close-user-modal');
const userEditForm = document.querySelector('.form--admin-edit-user');

let activeEditingUserId = null;

if (adminTable) {
  adminTable.addEventListener('click', e => {
    const row = e.target.closest('tr');
    if (!row) return;
    const userId = row.dataset.userId;

    // 1. HANDLE DELETE ACTION
    if (e.target.classList.contains('btn--admin-delete-user')) {
      e.preventDefault();
      const userName = row.querySelector('.user-name').textContent;
      if (confirm(`Are you sure you want to permanently delete account: "${userName}"?`)) {
        adminDeleteUser(userId);
      }
    }

    // 2. HANDLE EDIT MODAL TRIGGER
    if (e.target.classList.contains('btn--admin-edit-user')) {
      e.preventDefault();
      activeEditingUserId = userId;

      // Extract current DOM text properties from row selection
      const currentName = row.querySelector('.user-name').textContent;
      const currentEmail = row.querySelector('.user-email').textContent;
      const currentRole = row.querySelector('.user-role').dataset.role;

      // Prefill fields
      document.getElementById('modal-user-name').value = currentName;
      document.getElementById('modal-user-email').value = currentEmail;
      document.getElementById('modal-user-role').value = currentRole;

      // Display controls
      userModal.classList.remove('hidden');
      userOverlay.classList.remove('hidden');
    }
  });
}

// 3. CLOSE MODAL INTERACTIONS
if (closeUserModalBtn && userOverlay) {
  const closeUserModal = () => {
    userModal.classList.add('hidden');
    userOverlay.classList.add('hidden');
    activeEditingUserId = null;
  };

  closeUserModalBtn.addEventListener('click', closeUserModal);
  userOverlay.addEventListener('click', closeUserModal);
}

// 4. SUBMIT FORM ACTIONS
if (userEditForm) {
  userEditForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const name = document.getElementById('modal-user-name').value;
    const email = document.getElementById('modal-user-email').value;
    const role = document.getElementById('modal-user-role').value;

    if (activeEditingUserId) {
      adminUpdateUser(activeEditingUserId, { name, email, role });
    }
  });
}


// TOUR MODAL LOGIC

// const adminTable = document.querySelector('.admin-table');
const addTourBtn = document.querySelector('.btn--admin-add-tour');
const tourModal = document.querySelector('.tour-modal');
const tourOverlay = document.querySelector('.tour-modal-overlay');
const closeTourModalBtn = document.querySelector('.btn--close-tour-modal');
const tourForm = document.querySelector('.form--admin-tour');
const modalTitle = document.getElementById('tour-modal-title');
const modalSubmitBtn = document.getElementById('tour-modal-submit-btn');

let activeTourId = null; 
let modalMode = 'create'; // Toggles between 'create' or 'edit'

const toggleTourModal = (show = true) => {
  if (show) {
    tourModal.classList.remove('hidden');
    tourOverlay.classList.remove('hidden');
  } else {
    tourModal.classList.add('hidden');
    tourOverlay.classList.add('hidden');
    tourForm.reset();
    activeTourId = null;
  }
};

// 1. OPEN MODAL IN CREATE MODE
if (addTourBtn) {
  addTourBtn.addEventListener('click', () => {
    modalMode = 'create';
    modalTitle.textContent = 'Add New Tour';
    modalSubmitBtn.textContent = 'Create Tour';
    toggleTourModal(true);
  });
}

// 2. HANDLE TABLE CLICKS (EDIT OR DELETE)
if (adminTable) {
  adminTable.addEventListener('click', e => {
    const row = e.target.closest('tr');
    if (!row) return;
    const tourId = row.dataset.tourId;

    // A. HANDLE DELETION
    if (e.target.classList.contains('btn--admin-delete-tour')) {
      e.preventDefault();
      const tourName = row.querySelector('.tour-name').textContent;
      if (confirm(`Warning: Are you absolutely sure you want to delete "${tourName}"?`)) {
        adminDeleteTour(tourId);
      }
    }

    // B. HANDLE MODAL IN EDIT MODE
    if (e.target.classList.contains('btn--admin-edit-tour')) {
      e.preventDefault();
      modalMode = 'edit';
      activeTourId = tourId;
      
      modalTitle.textContent = 'Edit Tour Details';
      modalSubmitBtn.textContent = 'Save Changes';

      // Prefill values directly from current table row properties
      document.getElementById('modal-tour-name').value = row.dataset.name;
      document.getElementById('modal-tour-duration').value = row.dataset.duration;
      document.getElementById('modal-tour-max-size').value = row.dataset.maxSize;
      document.getElementById('modal-tour-price').value = row.dataset.price;
      document.getElementById('modal-tour-summary').value = row.dataset.summary;
      document.getElementById('modal-tour-difficulty').value = row.dataset.difficulty;
      document.getElementById('modal-tour-discount').value = row.dataset.discount || '';
      document.getElementById('modal-tour-description').value = row.dataset.description || '';

      toggleTourModal(true);
    }
  });
}

// 3. CLOSE MODAL TRIGGERS
if (closeTourModalBtn && tourOverlay) {
  closeTourModalBtn.addEventListener('click', () => toggleTourModal(false));
  tourOverlay.addEventListener('click', () => toggleTourModal(false));
}

// 4. SUBMIT FORM ROUTER
if (tourForm) {
  tourForm.addEventListener('submit', e => {
    e.preventDefault();

    const price = Number(document.getElementById('modal-tour-price').value);
    const discountInput = document.getElementById('modal-tour-discount').value;
    const discount = discountInput ? Number(discountInput) : null;

    // Frontend Check: Syncing schema's custom validation requirement (discount < price)
    if (discount !== null && discount >= price) {
      alert('Validation Error: Discount price must be strictly below the regular tour price!');
      return;
    }

    const form = new FormData();
    form.append('name', document.getElementById('modal-tour-name').value);
    form.append('difficulty', document.getElementById('modal-tour-difficulty').value);
    form.append('duration', document.getElementById('modal-tour-duration').value);
    form.append('maxGroupSize', document.getElementById('modal-tour-max-size').value);
    form.append('price', price);
    form.append('summary', document.getElementById('modal-tour-summary').value);
    
    if (discount !== null) form.append('priceDiscount', discount);
    
    const description = document.getElementById('modal-tour-description').value;
    if (description) form.append('description', description);

    // Handling array array initialization data for start dates
    const startDateVal = document.getElementById('modal-tour-date').value;
    if (startDateVal) {
      // The schema takes an array [Date], so we append it as a repeatable key array form field
      form.append('startDates[]', startDateVal);
    }

    const imageCoverFile = document.getElementById('modal-tour-image-cover').files[0];
    if (imageCoverFile) {
      form.append('imageCover', imageCoverFile);
    } else if (modalMode === 'create') {
      alert('Validation Error: A cover image file is required when creating a new tour.');
      return;
    }

    if (modalMode === 'create') {
      adminManageTour('POST', '/api/v1/tours', form);
    } else if (modalMode === 'edit' && activeTourId) {
      adminManageTour('PATCH', `/api/v1/tours/${activeTourId}`, form);
    }
  });
}