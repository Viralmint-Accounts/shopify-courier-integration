const axios = require("axios");

const {
  getToken,
} = require("../utils/tokenManager");

/*
CREATE SHIPMENT
*/
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
      "SHIPMENT RESPONSE:",
      JSON.stringify(
        response.data,
        null,
        2
      )
    );

    return documentRef;
  } catch (error) {
    console.error(
      "COURIER API ERROR:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}

/*
GET AWB
*/
async function getAWB(
  documentRef,
  orderNumber
) {
  try {
    /*
    NEW TOKEN EVERY TIME
    */
    const freshToken =
      await getToken();

    console.log(
      "NEW TOKEN GENERATED FOR AWB CHECK"
    );

    const response =
      await axios.post(
        "https://customerapi.sevasetu.in/index.php/clientbooking_v5/getshipmentdetails",
        {
          data: {
            IsDP: "0",

            ClientRefID:
              process.env
                .CLIENT_ID,

            bookingdate:
              new Date()
                .toISOString()
                .split("T")[0],
          },
        },
        {
          headers: {
            token:
              freshToken,

            clientcode:
              process.env
                .CLIENT_ID,

            "Content-Type":
              "application/json",
          },
        }
      );

    console.log(
      "AWB RESPONSE:",
      JSON.stringify(
        response.data,
        null,
        2
      )
    );

    /*
    AUTH FAILED
    */
    if (
      response.data.success ===
      "0"
    ) {
      return null;
    }

    if (
      !response.data.bookingdata
    ) {
      return null;
    }

    const shipment =
      response.data.bookingdata.find(
        (item) =>
          item.BookingRefNo ==
            documentRef ||
          item.OrderNo ==
            orderNumber
      );

    if (!shipment) {
      return null;
    }

    const awb =
      shipment.TrackingNo ||
      shipment.SmcsAwbNo;

    if (!awb) {
      console.log(
        "AWB STILL NOT GENERATED"
      );

      return null;
    }

    console.log(
      "AWB FOUND:",
      awb
    );

    return awb;
  } catch (error) {
    console.error(
      "AWB FETCH ERROR:",
      error.response?.data ||
        error.message
    );

    return null;
  }
}

/*
RETRY AWB
*/
async function getAWBWithRetry(
  documentRef,
  orderNumber
) {
  let attempts = 40;

  while (attempts > 0) {
    console.log(
      `CHECKING AWB... ${attempts}`
    );

    const awb = await getAWB(
      documentRef,
      orderNumber
    );

    if (awb) {
      return awb;
    }

    /*
    WAIT 30 SECONDS
    */
    await new Promise((resolve) =>
      setTimeout(resolve, 30000)
    );

    attempts--;
  }

  return null;
}

module.exports = {
  createShipment,
  getAWBWithRetry,
};