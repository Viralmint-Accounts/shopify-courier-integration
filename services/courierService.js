const axios = require("axios");

async function createShipment(
  order,
  token
) {
  try {
    const shipping =
      order.shipping_address;

    const documentRef = String(
      Date.now()
    ).padStart(14, "0");

    console.log(
      "DOCUMENT REF:",
      documentRef
    );

    const response =
      await axios.post(
        "https://customerapi.sevasetu.in/index.php/clientbooking_v5/insertbooking",
        {
          Data: [
            {
              data: {
                ClientRefID:
                  process.env
                    .CLIENT_ID,

                IsDP: "0",

                DocumentNoRef:
                  documentRef,

                OrderNo:
                  order.order_number,

                PickupPincode:
                  process.env
                    .PICKUP_PINCODE,

                ToPincode:
                  shipping.zip,

                CodBooking: "0",

                TypeID: "2",

                ServiceTypeID:
                  "1",

                TravelBy: "1",

                Weight: "500",

                Length: "2",

                Width: "2",

                Height: "2",

                ValueRs:
                  order.total_price,

                ReceiverName:
                  shipping.name,

                ReceiverAddress:
                  shipping.address1,

                ReceiverCity:
                  shipping.city,

                ReceiverState:
                  "1",

                Area:
                  shipping.city,

                ReceiverMobile:
                  shipping.phone ||
                  "9999999999",

                ReceiverEmail:
                  order.email,

                Remarks:
                  "Shopify Order",

                UserID:
                  process.env
                    .USER_ID,
              },
            },
          ],
        },
        {
          headers: {
            token,

            clientid:
              process.env
                .CLIENT_ID,

            "Content-Type":
              "application/json",
          },
        }
      );

    console.log(
      "COURIER RESPONSE:",
      JSON.stringify(
        response.data,
        null,
        2
      )
    );

    return response.data;
  } catch (error) {
    console.error(
      "COURIER API ERROR:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

module.exports = {
  createShipment,
};