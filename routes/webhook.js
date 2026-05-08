const express = require("express");

const crypto = require("crypto");

const { getToken } = require("../utils/tokenManager");

const {
  createShipment,
} = require("../services/courierService");

const {
  fulfillOrder,
} = require("../services/shopifyService");

const router = express.Router();

/*
Webhook Verification
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
POST /api/webhook
*/
router.post("/", async (req, res) => {
  try {
    /*
    Verify webhook
    */
    const isValid = verifyShopifyWebhook(req);

    if (!isValid) {
      return res.status(401).send("Unauthorized");
    }

    const order = req.body;

    console.log("=================================");
    console.log("NEW ORDER RECEIVED");
    console.log("Order:", order.name);
    console.log("=================================");

    /*
    Step 1: Generate Token
    */
    const token = await getToken();

    console.log("TOKEN GENERATED");

    /*
    Step 2: Create Shipment
    */
    const shipmentResponse = await createShipment(
      order,
      token
    );

    console.log(
      "SHIPMENT RESPONSE:",
      JSON.stringify(shipmentResponse, null, 2)
    );

    /*
    IMPORTANT:
    Replace this according to actual API response
    */
    const trackingNumber =
      shipmentResponse?.AWBNo ||
      shipmentResponse?.data?.AWBNo ||
      shipmentResponse?.awb ||
      shipmentResponse?.tracking_number;

    if (!trackingNumber) {
      throw new Error(
        "Tracking number not received from courier API"
      );
    }

    console.log("TRACKING NUMBER:", trackingNumber);

    /*
    Step 3: Fulfill Shopify Order
    */
    await fulfillOrder(order.id, trackingNumber);

    console.log("SHOPIFY FULFILLMENT COMPLETED");

    return res.status(200).json({
      success: true,
      trackingNumber,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR");

    console.error(
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data || error.message,
    });
  }
});

module.exports = router;