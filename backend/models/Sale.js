const mongoose = require("mongoose");
const User = require("./User"); //


const saleSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    upfrontAmount: { type: Number, required: true, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    description: { type: String },
    leadDate: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

saleSchema.pre("save", function (next) {
    this.remainingAmount = this.totalAmount - (this.upfrontAmount + this.receivedAmount);
    next();
});
  
const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
