const express = require("express");
const { createSale, getSales, getSaleById, updateSale, deleteSale, getSalesAnalytics } = require("../controllers/saleController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/authMiddleware");
const router = express.Router();




router.get("/analytics", protect, admin, getSalesAnalytics);


router.post("/", createSale); // Create a new sale
router.get("/:id", getSaleById); // Get a single sale
router.put("/:id", updateSale); // Update a sale





router.get("/", protect, getSales); // Get all sales with filters
router.delete("/:id", protect, admin, deleteSale); // Delete a sale (Admin only)


module.exports = router;
