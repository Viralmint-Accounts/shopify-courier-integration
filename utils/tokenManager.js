const axios = require("axios");

async function getToken() {
  try {
    console.log("LOGIN API STARTED");

    console.log("CLIENT_ID:", process.env.CLIENT_ID);

    console.log("LOGIN_USERNAME:", process.env.LOGIN_USERNAME);

    const response = await axios.post(
      "https://customerapi.sevasetu.in/index.php/clientbookingv5/login",
      {
        data: {
          loginusername:
            process.env.LOGIN_USERNAME,

          loginpassword:
            process.env.LOGIN_PASSWORD,
        },
      },
      {
        headers: {
          secretkey:
            process.env.SECRET_KEY,

          clientid:
            process.env.CLIENT_ID,

          "Content-Type":
            "application/json",
        },
      }
    );

    console.log(
      "LOGIN RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    return response.data.AuthToken;
  } catch (error) {
    console.error(
      "LOGIN API ERROR RESPONSE:",
      error.response?.data
    );

    console.error(
      "LOGIN API ERROR MESSAGE:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  getToken,
};