const axios = require("axios");

async function createShipment(order, token) {
  try {
    const shipping = order.shipping_address;

    /*
    Weight Logic
    */
    let totalWeight = 500;

    if (order.total_weight) {
      totalWeight = order.total_weight;
    }

    /*
    State Mapping
    Replace with dynamic mapping later
    */
    let stateId = "1";

    const response = await axios.post(
      "https://customerapi.sevasetu.in/index.php/clientbookingv5/insertbooking",
      {
        Data: [
          {
            data: {
              ClientRefID:
                process.env.CLIENT_ID,

              IsDP: "0",

              ReceiverName:
                shipping.name,

              DocumentNoRef:
                order.order_number.toString(),

              ToPincode:
                shipping.zip,

              TypeID: "2",

              ServiceTypeID: "1",

              TravelBy: "1",

              Weight:
                totalWeight.toString(),

              Length: "2",

              Width: "2",

              Height: "2",

              ValueRs:
                order.total_price,

              ReceiverAddress:
                shipping.address1,

              ReceiverCity:
                shipping.city,

              ReceiverState:
                stateId,

              Area:
                shipping.address2 || "",

              ReceiverMobile:
                shipping.phone ||
                "9999999999",

              ReceiverEmail:
                order.email,

              Remarks:
                "Shopify Order",

              UserID:
                process.env.USER_ID,

              PickupPincode:
                process.env.PICKUP_PINCODE,
            },
          },
        ],
      },
      {
        headers: {
          token: token,

          clientid:
            process.env.CLIENT_ID,

          "Content-Type":
            "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "COURIER API ERROR:",
      error.response?.data
    );

    throw error;
  }
}

module.exports = {
  createShipment,
};