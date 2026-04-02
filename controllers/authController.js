const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const db = require("../config/db"); 

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const role = User; // default

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    User.create(
      { name, email, password: hashedPassword, role },
      (err, result) => {
        // ✅ HANDLE DUPLICATE EMAIL
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              message: "Email already exists",
            });
          }

          return res.status(500).json({
            message: "Database error",
            error: err,
          });
        }

        // ✅ CREATE USER OBJECT
        const newUser = {
          id: result.insertId,
          name,
          email,
          role,
        };

        // ✅ CREATE TOKEN
        const token = jwt.sign(
          { id: newUser.id, isAdmin: newUser.isAdmin },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        // ✅ RETURN TOKEN + USER
        res.status(201).json({
          message: "User registered successfully",
          token,
          user: newUser, // ⭐ VERY IMPORTANT
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Get user from DB
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
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
