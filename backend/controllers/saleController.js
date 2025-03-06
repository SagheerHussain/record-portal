const Sale = require("../models/Sale");
const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const mongoose = require("mongoose");

// Validation Schema for Sales
const saleSchema = Joi.object({
  clientName: Joi.string().required(),
  totalAmount: Joi.number().min(0).required(),
  upfrontAmount: Joi.number().min(0).default(0),
  paymentMethod: Joi.string()
    .valid(
      "Cashapp",
      "Zelle",
      "Bank Transfer",
      "Paypal",
      "Credit Card",
      "Other"
    )
    .required(),
  description: Joi.string().allow(""),
  leadDate: Joi.date().required(),
  user: Joi.string().required(),
});

// Create a new sale
const createSale = asyncHandler(async (req, res) => {
  const { error } = saleSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const {
    clientName,
    totalAmount,
    upfrontAmount,
    paymentMethod,
    description,
    leadDate,
    user,
  } = req.body;

  const receivedAmount = 0; // ✅ Start receivedAmount at 0
  const remainingAmount = totalAmount - upfrontAmount; // ✅ Correct calculation
  const paymentStatus = remainingAmount === 0 ? "Completed" : "Partially Paid";

  const sale = new Sale({
    clientName,
    totalAmount,
    upfrontAmount,
    receivedAmount,
    remainingAmount,
    paymentStatus,
    paymentMethod,
    description,
    leadDate,
    user,
    paymentHistory:
      upfrontAmount > 0
        ? [{ amount: upfrontAmount, date: new Date(), method: paymentMethod }]
        : [],
  });

  const savedSale = await sale.save();
  res.status(201).json(savedSale);
});

const updateSale = async (req, res) => {
  try {
    const saleId = req.params.id.trim(); // ✅ Trim spaces/newlines

    // ✅ Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return res.status(400).json({ error: "Invalid Sale ID format" });
    }

    const { receivedAmount } = req.body;

    // ✅ Find the sale by ID
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // ✅ Ensure receivedAmount is a valid number
    if (typeof receivedAmount !== "number" || receivedAmount < 0) {
      return res.status(400).json({ error: "Invalid receivedAmount value" });
    }

    // ✅ Check if total receivedAmount exceeds totalAmount
    if (sale.receivedAmount + receivedAmount > sale.totalAmount) {
      return res
        .status(400)
        .json({ error: "Received amount exceeds total amount" });
    }

    // ✅ Update receivedAmount and remainingAmount correctly
    sale.receivedAmount += receivedAmount;
    sale.remainingAmount = sale.totalAmount - sale.receivedAmount;
    sale.paymentStatus =
      sale.remainingAmount === 0 ? "Completed" : "Partially Paid";

    // Ensure paymentHistory is an array before pushing
    if (!Array.isArray(sale.paymentHistory)) {
      sale.paymentHistory = [];
    }

    // ✅ Add entry to paymentHistory
    sale.paymentHistory.push({
      amount: receivedAmount,
      date: new Date(),
      method: sale.paymentMethod,
    });

    // ✅ Save the updated sale
    await sale.save();

    res.status(200).json({
      message: "Sale updated successfully",
      updatedSale: sale,
    });
  } catch (error) {
    console.error("❌ Error in updating sale:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch all sales with filters & pagination
const getSales = asyncHandler(async (req, res) => {
  const {
    clientName,
    startDate,
    endDate,
    paymentMethod,
    page = 1,
    limit = 10,
  } = req.query;

  let query = {};
  if (clientName) query.clientName = { $regex: clientName, $options: "i" };
  if (startDate && endDate)
    query.leadDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  if (paymentMethod) query.paymentMethod = paymentMethod;

  const sales = await Sale.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ total: sales.length, page, sales });
});

// ✅ Get a single sale by ID
const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!sale) return res.status(404).json({ message: "Sale not found" });
  res.status(200).json(sale);
});

// ✅ Delete a sale
const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) return res.status(404).json({ error: "Sale not found" });

  await sale.deleteOne();
  res.json({ message: "Sale deleted successfully" });
});

// ✅ Fetch Sales Analytics
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const [totalRevenue, pendingPayments, totalSales, completedSales] =
    await Promise.all([
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$receivedAmount" } } },
      ]),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$remainingAmount" } } },
      ]),
      Sale.countDocuments(),
      Sale.countDocuments({ remainingAmount: 0 }),
    ]);

  res.json({
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingPayments: pendingPayments[0]?.total || 0,
    totalSales,
    completedSales,
    pendingSales: totalSales - completedSales,
  });
});

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesAnalytics,
};
