import nodemailer from "nodemailer";

export const emailClient = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_SECRET,
    },
  });

function sendEmail(toEmail, subject, text) {
  // Send email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: subject,
    text: text,
  };
  emailClient().sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
}
export const sendResetPasswordEmail = (toEmail, pseudoRandomToken) => {
  const subject = "Paswword reset";
  const text = `${process.env.CLIENT_HOST_URI}/reset-password?token=${pseudoRandomToken}`;
  sendEmail(toEmail, subject, text);
};
export const sendVerifyEmail = (toEmail, pseudoRandomToken) => {
  const subject = "User's email verification";
  const text = `${process.env.CLIENT_HOST_URI}/verify-email?token=${pseudoRandomToken}`;
  sendEmail(toEmail, subject, text);
};
