const axios = require("axios");
const db = require("../config/db");

const PAYSTACK_SECRET = "sk_test_xxxxxxxxx"; // 🔥 replace

exports.initializePayment = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1. Get cart items
    const [cartItems] = await db.query(
      "SELECT * FROM cart WHERE user_id = ?",
      [user_id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Calculate total
    let total = 0;

    for (let item of cartItems) {
      const [product] = await db.query(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );

      total += product[0].price * item.quantity;
    }

    // 3. Convert to kobo (Paystack uses lowest currency unit)
    const amount = total * 100;

    // 4. Call Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: "customer@email.com", // later from user
        amount: amount,
        callback_url: "https://didwa-ecommerce-api-1.onrender.com/payment-success",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("PAYMENT INIT ERROR:", error.response?.data || error);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};
