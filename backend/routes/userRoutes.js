const express = require("express");
const { getAllUsers, createUser, deleteUser } = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Get all users (Admin only)
router.get("/", protect, admin, getAllUsers);

// ✅ Create a new user (Admin only)
router.post("/", protect, admin, createUser);


// 🔹 Delete a user (Admin only)
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
