const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// ✅ Protect Routes Middleware
const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
});

// ✅ Admin Middleware
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: No user data" });
  }
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access only" });
  }

  next();
};

module.exports = { protect, admin };
