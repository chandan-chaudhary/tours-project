// import '@babel/polyfill';
// // import 'core-js/stable';
// import axios from "axios";
//

const form = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");

const logOut = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://localhost:3000/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      // this will hard reload from server and will updated jwt cookies...
      // Reload from cache will reolad the same page as its is being displayed
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", "error cannot logout");
  }
};

if (logOutBtn) {
  logOutBtn.addEventListener("click", logOut);
}

const login = async (email, password) => {
  try {
    console.log(email, password);

    const res = await axios({
      method: "POST",
      url: "http://localhost:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    // redirecting to home page after user is loggin user
    if (res.data.status === "success") {
      showAlert("success", "logged in ");
      window.setTimeout(() => {
        location.assign("/"); //assign home page after 15 sec
      }, 1500);
    }
    // console.log();
  } catch (err) {
    showAlert("error", err.response.data.message);
    // console.log();
  }
};

// console.log('hello world');
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

const showAlert = (type, msg) => {
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 5000);
};

const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) {
    el.parentElement.removeChild(el);
  }
};
