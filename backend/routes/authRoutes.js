const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Register a new user
router.post("/register", registerUser);

// ✅ Login user
router.post("/login", loginUser);

// ✅ Logout user
router.post("/logout", logoutUser);

// ✅ Get user profile (Protected)
router.get("/profile", protect, getUserProfile);

// ✅ Update user profile (Protected)
router.put("/profile", protect, updateUserProfile);

// ✅ Get all users (Admin only)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
