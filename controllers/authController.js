const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const db = require("../config/db"); 

exports.register = async (req, res) => {
  try {
    console.log("REGISTER STARTED");

    const { name, email, password } = req.body;
    const role = "user"; // ✅ FIXED

    // ✅ Validate
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if email exists
    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    console.log("Hashing password...");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Inserting user...");

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      role,
    };

    console.log("Generating token...");

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role }, // ✅ FIXED
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("REGISTER SUCCESS");

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message || error.toString(),
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1️⃣ Get user from DB
   const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }


    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4️⃣ Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error); // <-- this prints exact issue
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
};
