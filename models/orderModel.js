const db = require("../config/db");

const Order = {
  create: (order, callback) => {
    db.query(
      "INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)",
      [order.user_id, order.product_id, order.quantity, order.total_price],
      callback
    );
  },

  getByUserId: (userId, callback) => {
    try {
      // 1. Get orders
      const [orders] = await db.query(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
        [userId]
      );
  
      // 2. Attach items to each order
      for (let order of orders) {
        const [items] = await db.query(
          `SELECT oi.*, p.name 
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
  
        order.items = items;
      }
  
      // 3. Return
      res.json({ orders });
  
    } catch (err) {
      console.error("USER ORDERS ERROR:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
}  
};

module.exports = Order;
