// const db = require("../config/db");
const db = require("../config/db");

const Product = {
  getAll: async () => {
  const [rows] = await db.query("SELECT * FROM products");
  return rows;
  },
  
  getById: (id, callback) => {
    db.query("SELECT * FROM products WHERE id = ?", [id], callback);
  },
  // productModel.js


  // Add product
  create: async (name, description, price, image, category) => {
    const sql = `
      INSERT INTO products (name, description, price, image, category)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, description, price, image, category]);
    return result;

  },

  
  getProductsByCategory: async (category, search = "", sort = "") => {
    let query = "SELECT * FROM products WHERE category = ?";
    let params = [category];

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    if (sort === "low") {
      query += " ORDER BY price ASC";
    } else if (sort === "high") {
      query += " ORDER BY price DESC";
    } else {
      query += " ORDER BY id DESC";
    }

    const [rows] = await db.query(query, params);
    return rows;
  },
};


module.exports = Product;