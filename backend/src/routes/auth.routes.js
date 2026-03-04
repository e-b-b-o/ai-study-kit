const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/auth.controller.js");

// @route   POST /api/auth/register
// @access  Public
router.post("/register", registerUser);

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginUser);

module.exports = router;
