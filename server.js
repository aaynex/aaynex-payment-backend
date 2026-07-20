const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
  console.error("Missing Razorpay API Keys");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

app.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: "Missing fields" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      return res.status(200).json({ verified: true });
    }

    return res.status(400).json({ verified: false, error: "Invalid signature" });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ verified: false, error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("AAYNEX Payment Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});