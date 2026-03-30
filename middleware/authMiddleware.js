const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader); // 👈 debug

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ FIX: Properly check format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Invalid token format" });
  }

  // ✅ FIX: Extract token correctly
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};