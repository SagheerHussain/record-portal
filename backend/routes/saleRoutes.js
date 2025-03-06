const express = require("express");
const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesAnalytics,
} = require("../controllers/saleController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch sales analytics (Admin only)
router.get("/analytics", protect, admin, getSalesAnalytics);

// Sales CRUD Operations
router
  .route("/")
  .post(protect, createSale) // Create a new sale (Protected)
  .get(protect, getSales); // Get all sales with filters (Protected)

router
  .route("/:id")
  .get(protect, getSaleById) // Get a single sale (Protected)
  .put(protect, updateSale) // Update a sale (Protected)
  .delete(protect, admin, deleteSale); // Delete a sale (Admin only)

module.exports = router;
