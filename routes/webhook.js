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
    LOGIN
    */
    const token = await getToken();

    console.log("TOKEN GENERATED");

    /*
    CREATE SHIPMENT
    */
    const documentRef =
      await createShipment(order, token);

    /*
    FETCH AWB
    */
    const trackingNumber =
      await getAWBWithRetry(
        token,
        documentRef,
        order.order_number
      );

    if (!trackingNumber) {
      throw new Error(
        "AWB not generated"
      );
    }

    console.log(
      "TRACKING NUMBER:",
      trackingNumber
    );

    /*
    UPDATE SHOPIFY
    */
    await fulfillOrder(
      order.id,
      trackingNumber
    );

    console.log(
      "SHOPIFY FULFILLMENT COMPLETED"
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