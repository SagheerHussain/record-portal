const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());



const userRoutes = require("./routes/userRoutes");
const saleRoutes = require("./routes/saleRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sales", saleRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

app.get("/", (req, res) => {
    res.send("API is running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
