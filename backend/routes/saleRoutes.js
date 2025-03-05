const express = require("express");
const { createSale, getSales, getSaleById, updateSale, deleteSale } = require("../controllers/saleController");

const router = express.Router();

// Routes for sales
router.post("/", createSale); // Create a new sale
router.get("/", getSales); // Get all sales
router.get("/:id", getSaleById); // Get a single sale
router.put("/:id", updateSale); // Update a sale
router.delete("/:id", deleteSale); // Delete a sale

module.exports = router;
