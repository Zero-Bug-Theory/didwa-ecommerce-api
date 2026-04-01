const db = require("../config/db"); // your MySQL connection

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT id, name, email, role FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    await db.promise().query(
      "UPDATE users SET name=?, email=?, role=? WHERE id=?",
      [name, email, role, id]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get logged-in user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, name, email, phone, address FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]); // ✅ MUST be object
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    await db.query(
      "UPDATE users SET name=?, phone=?, address=? WHERE id=?",
      [name, phone, address, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};


exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = req.file.filename;

    await db.query(
      "UPDATE users SET image=? WHERE id=?",
      [imagePath, userId]
    );

    res.json({ image: imagePath });
  } catch (err) {
    res.status(500).json({ message: "Image upload failed" });
  }
};


