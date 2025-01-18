const express = require("express");
const { register, login, authenticate } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate);

module.exports = router;
