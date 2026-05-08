require("dotenv").config();

const express = require("express");

const webhookRoutes = require("./routes/webhook");

const app = express();

/*
IMPORTANT:
Need raw body for Shopify HMAC validation
*/
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/webhook", webhookRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});