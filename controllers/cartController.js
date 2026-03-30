const Cart = require("../models/cartModel");
const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    console.log("GET CART USER:", user_id);

    const [rows] = await db.query(`
      SELECT 
        carts.id,
        carts.quantity,
        products.name,
        products.price,
        products.image
      FROM carts
      JOIN products ON carts.product_id = products.id
      WHERE carts.user_id = ?
    `, [user_id]);

    res.status(200).json(rows);

  } catch (error) {
    console.error("GET CART ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message, // 🔥 ADD THIS FOR DEBUG
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user.id; // ✅ FROM TOKEN
    const { product_id, quantity } = req.body;

    console.log("USER ID:", user_id);
    console.log("PRODUCT ID:", product_id);

    // CHECK IF PRODUCT EXISTS IN CART
    const [existing] = await db.query(
      "SELECT * FROM carts WHERE user_id = ? AND product_id = ?",
      [user_id, product_id] // ✅ fixed variable name
    );

    if (existing.length > 0) {
      // UPDATE QUANTITY
      await db.query(
        "UPDATE carts SET quantity = quantity + ? WHERE id = ?",
        [quantity || 1, existing[0].id] // allow increment by quantity
      );

      return res.json({ message: "Quantity updated" });
    } else {
      // INSERT NEW
      await db.query(
        "INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [user_id, product_id, quantity || 1]
      );

      return res.json({ message: "Added to cart" });
    }
  } catch (error) {
    console.error("CART ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message }); // include error for debugging
  }
};
 
exports.removeFromCart = async (req, res) => {
  try {
    const cartId = req.params.id;

    await db.query("DELETE FROM carts WHERE id = ?", [cartId]);
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("REMOVE CART ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateQuantity = (req, res) => {
  const quantity = parseInt(req.body.quantity) || 1;
  const cartId = req.params.id;

  const sql = "UPDATE carts SET quantity=? WHERE id=?";
  db.query(sql, [quantity, cartId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Quantity updated" });
  });
};