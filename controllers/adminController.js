const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [users] = await db.query("SELECT COUNT(*) AS total FROM users");
    const [products] = await db.query("SELECT COUNT(*) AS total FROM products");
    const [orders] = await db.query("SELECT COUNT(*) AS total FROM orders");

    const [revenue] = await db.query(
      "SELECT SUM(total_amount) AS total FROM orders WHERE status='paid'"
    );

    const [pending] = await db.query(
      "SELECT COUNT(*) AS total FROM orders WHERE status='pending'"
    );

    // const [outOfStock] = await db.query(
    //   "SELECT COUNT(*) AS total FROM products WHERE stock = 0"
    // );

    res.json({
      totalUsers: users[0].total,
      totalProducts: products[0].total,
      totalOrders: orders[0].total,
      totalRevenue: revenue[0].total || 0,
      pendingOrders: pending[0].total,
      // outOfStock: outOfStock[0].total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getRevenue = async (req, res) => {
  try {
    // Total revenue
    const [total] = await db.query(
      "SELECT SUM(total_amount) AS total FROM orders WHERE status='paid'"
    );

    // Revenue per day
    const [daily] = await db.query(`
      SELECT DATE(created_at) as date,
             SUM(total_amount) as total
      FROM orders
      WHERE status='paid'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Total paid orders
    const [count] = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE status='paid'"
    );

    res.json({
      total_revenue: total[0].total || 0,
      total_orders: count[0].count,
      daily_revenue: daily,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



