const express = require("express");

const crypto = require("crypto");

const { getToken } = require("../utils/tokenManager");

const {
  createShipment,
  getAWBWithRetry,
} = require("../services/courierService");

const {
  fulfillOrder,
} = require("../services/shopifyService");

const router = express.Router();

/*
VERIFY SHOPIFY WEBHOOK
*/
function verifyShopifyWebhook(req) {
  const hmac = req.get("X-Shopify-Hmac-Sha256");

  const generatedHash = crypto
    .createHmac(
      "sha256",
      process.env.SHOPIFY_WEBHOOK_SECRET
    )
    .update(req.rawBody, "utf8")
    .digest("base64");

  return generatedHash === hmac;
}

/*
WEBHOOK
*/
router.post("/", async (req, res) => {
  try {
    const isValid = verifyShopifyWebhook(req);

    if (!isValid) {
      return res.status(401).send("Unauthorized");
    }

    const order = req.body;

    console.log("=================================");
    console.log("NEW ORDER RECEIVED");
    console.log("Order:", order.order_number);
    console.log("=================================");

    /*
    STEP 1: LOGIN
    */
    const token = await getToken();

    console.log("TOKEN GENERATED");

    /*
    STEP 2: CREATE SHIPMENT
    */
    const documentRef =
      await createShipment(order, token);

    /*
    STEP 3: FETCH AWB
    */
  /*
BACKGROUND AWB CHECK
*/
getAWBWithRetry(
  documentRef,
  order.order_number,
  order.id
);

console.log(
  "AWB background process started"
);

    return res.status(200).json({
      success: true,
      trackingNumber,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR");

    console.error(
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data ||
        error.message,
    });
  }
});

module.exports = router;