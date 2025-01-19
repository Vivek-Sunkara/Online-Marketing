const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming a User model exists
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret_key";

// Register
router.post(
  "/register",
  [
    body("email", "Invalid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    body("name", "Name is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      user = new User({ name, email, password: hashedPassword });
      await user.save();

      // Generate token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email", "Invalid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
