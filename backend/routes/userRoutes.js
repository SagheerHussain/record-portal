const express = require("express");
const {
  getAllUsers, // ✅ Correct function name
  createUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Fetch all users (Admin only)
router.get("/", protect, admin, getAllUsers); // ✅ Corrected function name

// ✅ Create a new user
router.post("/", protect, admin, createUser);

// ✅ Delete a user
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
