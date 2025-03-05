const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");  // ✅ Import Protect Middleware

const router = express.Router();

// ✅ Register a new user
router.post("/register", registerUser);

// ✅ Login user
router.post("/login", loginUser);

// ✅ Fetch user profile (Protected)
router.get("/profile", protect, getUserProfile);

module.exports = router;
