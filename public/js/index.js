/* eslint-disable */
import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';
import { signup } from './signup.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { showAlert } from './alerts.js';
import { updateReview, deleteReview, adminDeleteReview } from './review.js';
import { adminUpdateUser, adminDeleteUser } from './manageUsers.js';
import { adminManageTour, adminDeleteTour, uploadTourImage } from './manageTours.js';

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

// --- DYNAMIC ROW HELPERS ---

// Add a start date row to the container
const addStartDateRow = (value = '') => {
  const container = document.getElementById('start-dates-container');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'form__group start-date-row';
  row.style.cssText = 'display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;';
  const dateStr = value ? new Date(value).toISOString().split('T')[0] : '';
  row.innerHTML = `
    <input type="date" class="form__input start-date-input" value="${dateStr}" style="flex: 1;">
    <button type="button" class="btn btn--small btn--red btn--remove-date" style="font-size: 1.1rem;">&times;</button>
  `;
  container.appendChild(row);
};

// Add a location row to the container
const addLocationRow = (loc = {}) => {
  const container = document.getElementById('locations-container');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'form__group location-row';
  row.style.cssText = 'border: 1px solid #eee; border-radius: 5px; padding: 1.5rem; margin-bottom: 1rem; position: relative;';
  const coords = loc.coordinates || [];
  row.innerHTML = `
    <button type="button" class="btn btn--small btn--red btn--remove-location" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1.1rem;">&times;</button>
    <div class="form__group">
      <label class="form__label">Description</label>
      <input type="text" class="form__input loc-description" value="${loc.description || ''}" placeholder="Location name">
    </div>
    <div style="display: flex; gap: 2rem;">
      <div class="form__group" style="flex: 1;">
        <label class="form__label">Longitude</label>
        <input type="number" step="any" class="form__input loc-lng" value="${coords[0] || ''}" placeholder="-80.128473">
      </div>
      <div class="form__group" style="flex: 1;">
        <label class="form__label">Latitude</label>
        <input type="number" step="any" class="form__input loc-lat" value="${coords[1] || ''}" placeholder="25.781842">
      </div>
      <div class="form__group" style="flex: 1;">
        <label class="form__label">Day</label>
        <input type="number" min="0" class="form__input loc-day" value="${loc.day != null ? loc.day : ''}" placeholder="1">
      </div>
    </div>
  `;
  container.appendChild(row);
};

// Render guide checkboxes from server-injected data
const renderGuideCheckboxes = (selectedIds = []) => {
  const container = document.getElementById('guides-container');
  if (!container || !window.__availableGuides) return;
  container.innerHTML = '';
  window.__availableGuides.forEach(guide => {
    const checked = selectedIds.includes(guide.id) ? 'checked' : '';
    const roleLabel = guide.role === 'lead-guide' ? 'Lead Guide' : 'Guide';
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; min-width: 20rem;';
    div.innerHTML = `
      <input type="checkbox" class="guide-checkbox" value="${guide.id}" id="guide-${guide.id}" ${checked} style="width: 2rem; height: 2rem;">
      <label for="guide-${guide.id}" class="form__label" style="margin-bottom: 0; cursor: pointer;">${guide.name} <span style="color: #999; font-size: 1.1rem;">(${roleLabel})</span></label>
    `;
    container.appendChild(div);
  });
};

// Clear all dynamic rows
const clearDynamicRows = () => {
  const datesContainer = document.getElementById('start-dates-container');
  const locsContainer = document.getElementById('locations-container');
  if (datesContainer) datesContainer.innerHTML = '';
  if (locsContainer) locsContainer.innerHTML = '';
  renderGuideCheckboxes([]);
};

const toggleTourModal = (show = true) => {
  if (show) {
    tourModal.classList.remove('hidden');
    tourOverlay.classList.remove('hidden');
  } else {
    tourModal.classList.add('hidden');
    tourOverlay.classList.add('hidden');
    tourForm.reset();
    clearDynamicRows();
    activeTourId = null;
  }
};

// --- EVENT DELEGATION FOR DYNAMIC REMOVE BUTTONS ---
if (tourForm) {
  tourForm.addEventListener('click', e => {
    if (e.target.classList.contains('btn--remove-date')) {
      e.target.closest('.start-date-row').remove();
    }
    if (e.target.classList.contains('btn--remove-location')) {
      e.target.closest('.location-row').remove();
    }
  });
}

// --- ADD ROW BUTTONS ---
const addDateBtn = document.querySelector('.btn--add-start-date');
const addLocBtn = document.querySelector('.btn--add-location');

if (addDateBtn) addDateBtn.addEventListener('click', () => addStartDateRow());
if (addLocBtn) addLocBtn.addEventListener('click', () => addLocationRow());

// 1. OPEN MODAL IN CREATE MODE
if (addTourBtn) {
  addTourBtn.addEventListener('click', () => {
    modalMode = 'create';
    modalTitle.textContent = 'Add New Tour';
    modalSubmitBtn.textContent = 'Create Tour';
    clearDynamicRows();
    renderGuideCheckboxes([]);
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

      // Prefill basic fields
      document.getElementById('modal-tour-name').value = row.dataset.name;
      document.getElementById('modal-tour-duration').value = row.dataset.duration;
      document.getElementById('modal-tour-max-size').value = row.dataset.maxSize;
      document.getElementById('modal-tour-price').value = row.dataset.price;
      document.getElementById('modal-tour-summary').value = row.dataset.summary;
      document.getElementById('modal-tour-difficulty').value = row.dataset.difficulty;
      document.getElementById('modal-tour-discount').value = row.dataset.discount || '';
      document.getElementById('modal-tour-description').value = row.dataset.description || '';

      // Prefill Start Location
      try {
        const startLoc = JSON.parse(row.dataset.startLocation || '{}');
        document.getElementById('modal-start-loc-desc').value = startLoc.description || '';
        document.getElementById('modal-start-loc-address').value = startLoc.address || '';
        const coords = startLoc.coordinates || [];
        document.getElementById('modal-start-loc-lng').value = coords[0] || '';
        document.getElementById('modal-start-loc-lat').value = coords[1] || '';
      } catch (err) { /* ignore parse errors */ }

      // Prefill Start Dates
      clearDynamicRows();
      try {
        const dates = JSON.parse(row.dataset.startDates || '[]');
        dates.forEach(d => addStartDateRow(d));
      } catch (err) { /* ignore parse errors */ }

      // Prefill Locations
      try {
        const locs = JSON.parse(row.dataset.locations || '[]');
        locs.forEach(loc => addLocationRow(loc));
      } catch (err) { /* ignore parse errors */ }

      // Prefill Guides
      try {
        const guideIds = JSON.parse(row.dataset.guides || '[]');
        renderGuideCheckboxes(guideIds);
      } catch (err) { renderGuideCheckboxes([]); }

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
  tourForm.addEventListener('submit', async e => {
    e.preventDefault();

    const price = Number(document.getElementById('modal-tour-price').value);
    const discountInput = document.getElementById('modal-tour-discount').value;
    const discount = discountInput ? Number(discountInput) : undefined;

    // Frontend Check: Syncing schema's custom validation requirement (discount < price)
    if (discount !== undefined && discount >= price) {
      alert('Validation Error: Discount price must be strictly below the regular tour price!');
      return;
    }

    // Build Start Location object
    const startLocDesc = document.getElementById('modal-start-loc-desc').value;
    const startLocAddress = document.getElementById('modal-start-loc-address').value;
    const startLocLng = document.getElementById('modal-start-loc-lng').value;
    const startLocLat = document.getElementById('modal-start-loc-lat').value;

    let startLocation;
    if (startLocLng && startLocLat) {
      startLocation = {
        type: 'Point',
        description: startLocDesc || '',
        coordinates: [Number(startLocLng), Number(startLocLat)],
        address: startLocAddress || '',
      };
    }

    // Collect Start Dates
    const startDates = [];
    document.querySelectorAll('.start-date-input').forEach(input => {
      if (input.value) startDates.push(input.value);
    });

    // Collect Locations
    const locations = [];
    document.querySelectorAll('.location-row').forEach(row => {
      const desc = row.querySelector('.loc-description').value;
      const lng = row.querySelector('.loc-lng').value;
      const lat = row.querySelector('.loc-lat').value;
      const day = row.querySelector('.loc-day').value;
      if (lng && lat) {
        locations.push({
          type: 'Point',
          description: desc || '',
          coordinates: [Number(lng), Number(lat)],
          day: day ? Number(day) : 0,
        });
      }
    });

    // Collect selected Guide IDs
    const guides = [];
    document.querySelectorAll('.guide-checkbox:checked').forEach(cb => {
      guides.push(cb.value);
    });

    // Build JSON payload
    const tourData = {
      name: document.getElementById('modal-tour-name').value,
      difficulty: document.getElementById('modal-tour-difficulty').value,
      duration: Number(document.getElementById('modal-tour-duration').value),
      maxGroupSize: Number(document.getElementById('modal-tour-max-size').value),
      price,
      summary: document.getElementById('modal-tour-summary').value,
    };

    if (discount !== undefined) tourData.priceDiscount = discount;

    const description = document.getElementById('modal-tour-description').value;
    if (description) tourData.description = description;

    if (startLocation) tourData.startLocation = startLocation;
    if (startDates.length) tourData.startDates = startDates;
    if (locations.length) tourData.locations = locations;
    if (guides.length) tourData.guides = guides;

    // Check for cover image file
    const imageCoverFile = document.getElementById('modal-tour-image-cover').files[0];

    if (!imageCoverFile && modalMode === 'create') {
      alert('Validation Error: A cover image file is required when creating a new tour.');
      return;
    }

    // Disable submit button during request
    modalSubmitBtn.textContent = 'Saving...';
    modalSubmitBtn.disabled = true;

    let result;
    if (modalMode === 'create') {
      result = await adminManageTour('POST', '/api/v1/tours', tourData, 'create');
    } else if (modalMode === 'edit' && activeTourId) {
      result = await adminManageTour('PATCH', `/api/v1/tours/${activeTourId}`, tourData, 'update');
    }

    // If a cover image was selected, upload it as a follow-up PATCH
    if (result && imageCoverFile) {
      const tourId = result._id || result.id || activeTourId;
      await uploadTourImage(tourId, imageCoverFile);
    }

    // Re-enable button (the page will reload from adminManageTour on success)
    modalSubmitBtn.textContent = modalMode === 'create' ? 'Create Tour' : 'Save Changes';
    modalSubmitBtn.disabled = false;
  });
}