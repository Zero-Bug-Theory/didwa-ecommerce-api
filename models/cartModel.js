const db = require("../config/db");

const Cart = {
  getByUserId: (userId, callback) => {
    db.query("SELECT * FROM carts WHERE user_id = ?", [userId], callback);
  },
  
  addItem: (item, callback) => {
    db.query(
      "INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [item.user_id, item.product_id, item.quantity],
      callback
    );
  },
  removeItem: (id, callback) => {
    db.query("DELETE FROM carts WHERE id = ?", [id], callback);
  },
};

module.exports = Cart;