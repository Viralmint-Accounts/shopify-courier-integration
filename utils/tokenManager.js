const axios = require("axios");

async function getToken() {
  try {
    console.log("LOGIN API STARTED");

    const response = await axios.post(
      "https://customerapi.sevasetu.in/index.php/clientbooking_v5/login",
      {
        data: {
          login_username:
            process.env.LOGIN_USERNAME,

          login_password:
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
      "LOGIN API ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
}

module.exports = {
  getToken,
};