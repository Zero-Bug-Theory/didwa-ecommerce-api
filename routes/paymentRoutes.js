const express = require("express");
const router = express.Router();
// const isAdmin = require(isAdmin);
const isAdmin = require("../middleware/adminMiddleware");
const { paystackPayment } = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post("/pay", authMiddleware, initializePayment);

module.exports = router;
