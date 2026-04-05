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
    db.query("SELECT * FROM orders WHERE user_id = ?", [userId], callback);
  },
};
module.exports = Order;
