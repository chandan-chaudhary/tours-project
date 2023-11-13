//
const form = document.querySelector('.form');

const login = async (email, password) => {
  try {
    console.log(email, password);

    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    // redirecting to home page after user is loggin user
    if (res.data.status === 'success') {
      alert('loged in ');
      window.setTimeout(() => {
        location.assign('/'); //assign home page after 15 sec
      }, 1500);
    }
    // console.log();
  } catch (err) {
    alert(err.response.data.message);
    // console.log();
  }
};
console.log('hello world');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
