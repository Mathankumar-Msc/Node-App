const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
      user: 'unluckyboysam5@gmail.com', // Your email
      pass: 'bbdf bsun qyuv pjjm', // Your email password
  },
});

const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// const login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).send({ error: 'Invalid credentials' });
//         }
//         const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
//         res.send({ token });
//     } catch (error) {
//         res.status(400).send({ error: error.message });
//     }
// };
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });

      
      if (!user) {
          return res.status(404).send({ error: 'User not found' });
      }

      // Directly compare the plain text password (not recommended for production)
      if (password !== user.password) {
          return res.status(400).send({ error: 'Invalid credentials' });
      }

      // Send a success message
      res.status(200).send({ message: 'Login successful' });
  } catch (error) {
      res.status(400).send({ error: error.message });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).send({ error: 'User not found' });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();

      // Send email with reset link
      const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
      const mailOptions = {
          to: user.email,
          from: 'unluckyboysam5@gmail.com',
          subject: 'Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste it into your browser to complete the process:\n\n
          ${resetUrl}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send({ message: 'Password reset email sent' });
  } catch (error) {
      res.status(400).send({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
      });

      if (!user) {
          return res.status(400).send({ error: 'Invalid or expired token' });
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).send({ message: 'Password reset successful' });
  } catch (error) {
      res.status(400).send({ error: error.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };