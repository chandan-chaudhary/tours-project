const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const path = require('path');

// `${__dirname}/../views/emails/${template}`;
// const file = fs.readFileSync(`${__dirname}/../views/emails/${template}`);
// path.join(__dirname, '..', 'views', 'emails', `${template}`),
// send actual mail
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `chandan <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // render HTML
    const html = pug.renderFile(
      path.join(__dirname, '..', 'views', 'emails', `${template}.pug`),
      {
        firstName: this.firstname,
        url: this.url,
        subject,
      },
    );

    // send mail option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
    };

    // create TRANSPORT and SEND MAIL
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    // console.log()
    await this.send(
      'welcome',
      'Welcome to the world of tour, here you can chosse destination for your trip',
    );
  }

  async sendResetPassword() {
    await this.send('resetPassword', 'Reset your password (Valid for 10 min)');
  }
};

// const sendMail = async (options) => {
//   // create transport
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   //define email options

//   const mailOptions = {
//     from: 'chandan <chandan@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendMail;
