const axios = require("axios");

async function getToken() {
  try {
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

    return response.data.AuthToken;
  } catch (error) {
    console.error(
      "LOGIN API ERROR:",
      error.response?.data
    );

    throw error;
  }
}

module.exports = {
  getToken,
};