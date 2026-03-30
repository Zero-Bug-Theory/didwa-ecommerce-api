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