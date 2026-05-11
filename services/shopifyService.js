const axios = require("axios");

async function fulfillOrder(
  orderId,
  trackingNumber
) {
  try {
    /*
    GET FULFILLMENT ORDER
    */
    const fulfillmentOrdersResponse =
      await axios.get(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2025-01/orders/${orderId}/fulfillment_orders.json`,
        {
          headers: {
            "X-Shopify-Access-Token":
              process.env
                .SHOPIFY_ACCESS_TOKEN,

            "Content-Type":
              "application/json",
          },
        }
      );

    const fulfillmentOrders =
      fulfillmentOrdersResponse
        .data
        .fulfillment_orders;

    if (
      !fulfillmentOrders ||
      !fulfillmentOrders.length
    ) {
      throw new Error(
        "No fulfillment orders found"
      );
    }

    const fulfillmentOrderId =
      fulfillmentOrders[0].id;

    /*
    CREATE FULFILLMENT
    */
    const fulfillmentResponse =
      await axios.post(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2025-01/fulfillments.json`,
        {
          fulfillment: {
            notify_customer: true,

            tracking_info: {
              number:
                trackingNumber,

              company:
                "Seva Setu",
            },

            line_items_by_fulfillment_order:
              [
                {
                  fulfillment_order_id:
                    fulfillmentOrderId,
                },
              ],
          },
        },
        {
          headers: {
            "X-Shopify-Access-Token":
              process.env
                .SHOPIFY_ACCESS_TOKEN,

            "Content-Type":
              "application/json",
          },
        }
      );

    console.log(
      "FULFILLMENT RESPONSE:",
      JSON.stringify(
        fulfillmentResponse.data,
        null,
        2
      )
    );

    return fulfillmentResponse.data;
  } catch (error) {
    console.error(
      "SHOPIFY FULFILLMENT ERROR:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

module.exports = {
  fulfillOrder,
};