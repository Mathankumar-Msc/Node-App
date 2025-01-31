const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
      console.log("user",user);
      
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
module.exports = { register, login };