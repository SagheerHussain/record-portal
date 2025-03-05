const Sale = require("../models/Sale");

// ✅ Create a new sale
const createSale = async (req, res) => {
    try {
      const { clientName, totalAmount, upfrontAmount = 0, receivedAmount = 0, paymentMethod, description, leadDate, user } = req.body;
  
      if (!clientName || !totalAmount || !paymentMethod || !leadDate || !user) {
        return res.status(400).json({ error: "Please fill in all required fields." });
      }
  
      const sale = new Sale({
        clientName,
        totalAmount,
        upfrontAmount,
        receivedAmount,
        remainingAmount: totalAmount - (upfrontAmount + receivedAmount), // Auto-calculate
        paymentMethod,
        description,
        leadDate,
        user
      });
  
      const savedSale = await sale.save();
      res.status(201).json(savedSale);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// ✅ Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("user", "name email");
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// ✅ Delete a sale
const updateSale = async (req, res) => {
    try {
        const { receivedAmount } = req.body;
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ error: "Sale not found" });
        }

        // ✅ Prevent adding more payments if remainingAmount is already 0
        if (sale.remainingAmount === 0) {
            return res.status(400).json({ error: "Payment already completed. No remaining amount left." });
        }

        // ✅ Ensure receivedAmount is a valid number
        if (!receivedAmount || receivedAmount <= 0) {
            return res.status(400).json({ error: "Received amount must be greater than 0" });
        }

        // ✅ First payment goes into upfrontAmount
        if (sale.upfrontAmount === 0) {
            sale.upfrontAmount = receivedAmount;
        } else {
            sale.receivedAmount += receivedAmount;
        }

        // ✅ Calculate new remainingAmount
        sale.remainingAmount = sale.totalAmount - (sale.upfrontAmount + sale.receivedAmount);

        // ✅ Ensure remainingAmount never goes negative
        if (sale.remainingAmount < 0) {
            return res.status(400).json({ error: "Received amount exceeds remaining balance." });
        }

        // Save updated sale
        await sale.save();
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ Delete a sale
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale };
