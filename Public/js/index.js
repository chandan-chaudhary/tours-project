// import '@babel/polyfill';
// // import 'core-js/stable';
// import axios from "axios";
//

// const client_key =;
const stripe = Stripe(
  'pk_test_51OGE3tSDYixnJC7yC3vkHJhbtg6ia787MVWWkzBpW0VxUyCvZZ0r0WbHD7a9ZQMUe3aDQXLVCpK4bWipLe9ko8nQ001LKDf8Ck',
);

const form = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');

// LOGOUT USER
const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      // this will hard reload from server and will updated jwt cookies...
      // Reload from cache will reolad the same page as its is being displayed
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'error cannot logout');
  }
};

// EVENT ON LOGOUT USER
if (logOutBtn) {
  logOutBtn.addEventListener('click', logOut);
}

// LOGIN USER
const login = async (email, password) => {
  try {
    console.log(email, password);

    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    // redirecting to home page after user is loggin user
    if (res.data.status === 'success') {
      showAlert('success', 'logged in ');
      window.setTimeout(() => {
        location.assign('/'); //assign home page after 15 sec
      }, 1500);
    }
    // console.log();
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log('login', err);
  }
};

// EVENT ON LOGIN USER
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
// UPDATE USER DATA
const updateSettings = async (data, type) => {
  try {
    // mention url
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updatepassword'
        : 'http://localhost:3000/api/v1/users/update-logged-user';
    // send response
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// EVENT ON UPDATE USER SETTINGS
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}
//EVENT FOR PASSWORD UPDATE
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password',
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// STRIPE SESSION
const bookTour = async (tourId) => {
  try {
    // get session from backend API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // create checkout form and checkout payment
    await stripe.redirectToCheckout({
      sessionId : session.data.session.id,
    })
    console.log(session);
  } catch (err) {
    showAlert('error', err.message);
  }
};

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    // e.preventDefault();
    e.target.textContent = 'Processing...';
    // e.target response to the event got triggred.. so btn have data like data-tour-id where tour-id automatically becomes tourId in javascript
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

// SHOW ALERT FUNCTION
const showAlert = (type, msg) => {
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

// HIDE ALERT FUNCTION
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};
