const Sale = require("../models/Sale");
const asyncHandler = require("express-async-handler");

// ✅ Create a new sale
const createSale = async (req, res) => {
  try {
      const { clientName, totalAmount, upfrontAmount = 0, paymentMethod, description, leadDate, user } = req.body;

      if (!clientName || !totalAmount || !paymentMethod || !leadDate || !user) {
          return res.status(400).json({ error: "Please fill in all required fields." });
      }

      let receivedAmount = upfrontAmount; // Upfront is counted as received initially
      let remainingAmount = totalAmount - upfrontAmount;

      // Determine initial payment status
      let paymentStatus = "Pending";
      if (receivedAmount > 0 && remainingAmount > 0) {
          paymentStatus = "Partially Paid";
      } else if (remainingAmount === 0) {
          paymentStatus = "Completed";
      }

      
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
          paymentHistory: upfrontAmount > 0 ? [{ amount: upfrontAmount, date: new Date(), method: paymentMethod }] : []
      });

      const savedSale = await sale.save();
      res.status(201).json(savedSale);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


// ✅ Update Sale (Receive Payment)
const updateSale = async (req, res) => {
  try {
      const { receivedAmount, paymentMethod } = req.body;
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
          return res.status(404).json({ error: "Sale not found" });
      }

      if (!receivedAmount || receivedAmount <= 0) {
          return res.status(400).json({ error: "Received amount must be greater than 0" });
      }

      if (sale.remainingAmount === 0) {
          return res.status(400).json({ error: "Payment already completed. No remaining amount left." });
      }

      let newReceivedAmount = sale.receivedAmount + receivedAmount;
      let newRemainingAmount = sale.totalAmount - newReceivedAmount;

      if (newRemainingAmount < 0) {
          return res.status(400).json({ error: "Received amount exceeds remaining balance." });
      }

      // Update received amount and remaining balance
      sale.receivedAmount = newReceivedAmount;
      sale.remainingAmount = newRemainingAmount;

      // Update payment status
      if (newRemainingAmount === 0) {
          sale.paymentStatus = "Completed";
      } else {
          sale.paymentStatus = "Partially Paid";
      }

      if (!sale.paymentHistory) {
        sale.paymentHistory = [];
      }

    sale.paymentHistory.push({
        amount: receivedAmount,
        date: new Date(),
        method: paymentMethod || "Unknown"
    });
      await sale.save();
      res.json(sale);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


const getSales = asyncHandler(async (req, res) => {
    const { clientName, startDate, endDate, paymentMethod, page, limit } = req.query;

    let query = {};

    // Filter by client name (case insensitive)
    if (clientName) {
        query.clientName = { $regex: clientName, $options: "i" };
    }

    // Filter by date range
    if (startDate && endDate) {
        query.leadDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Filter by payment method
    if (paymentMethod) {
        query.paymentMethod = paymentMethod;
    }

    // Pagination settings
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Fetch sales from database
    const sales = await Sale.find(query).skip(skip).limit(pageSize);

    res.status(200).json({
        total: sales.length,
        page: pageNumber,
        sales,
    });
});

// ✅ Get a single sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("user", "name email");
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Delete a Sale
const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ error: "Sale not found" });
        }

        await sale.deleteOne();
        res.json({ message: "Sale deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Fetch Sales Analytics
const getSalesAnalytics = async (req, res) => {
  try {
      const totalRevenue = await Sale.aggregate([
          { $group: { _id: null, total: { $sum: "$receivedAmount" } } }
      ]);

      const pendingPayments = await Sale.aggregate([
          { $group: { _id: null, total: { $sum: "$remainingAmount" } } }
      ]);

      const totalSales = await Sale.countDocuments();
      const completedSales = await Sale.countDocuments({ remainingAmount: 0 });
      const pendingSales = totalSales - completedSales;

      res.json({
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingPayments: pendingPayments[0]?.total || 0,
          totalSales,
          completedSales,
          pendingSales
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};



module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale, getSalesAnalytics };
