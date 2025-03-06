const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    upfrontAmount: {
      type: Number,
      required: [true, "Upfront amount is required"],
      default: 0,
      min: [0, "Amount cannot be negative"],
    },
    receivedAmount: {
      type: Number,
      default: 0,
      min: [0, "Amount cannot be negative"],
    },
    remainingAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Amount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: [
        "Cashapp",
        "Zelle",
        "Bank Transfer",
        "Paypal",
        "Credit Card",
        "Other",
      ], // Restricting to valid values
    },
    currency: {
      type: String,
      default: "USD",
    },
    description: {
      type: String,
      trim: true,
    },
    leadDate: {
      type: Date,
      required: [true, "Sale Lead date is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
  },
  { timestamps: true }
);

// 🔹 Auto-calculate remainingAmount before saving
saleSchema.pre("save", function (next) {
  this.remainingAmount =
    this.totalAmount - (this.upfrontAmount + this.receivedAmount);
  next();
});

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
