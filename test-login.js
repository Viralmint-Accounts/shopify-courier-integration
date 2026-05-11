const axios = require("axios");

async function testLogin() {
  try {
    const payload = JSON.stringify({
      data: {
        loginusername:
          "JABSONSFOODSPRIVATELIMITED(ONLINE)",

        loginpassword:
          "Jabson@7890",
      },
    });

    const response = await axios({
      method: "post",

      url: "https://customerapi.sevasetu.in/index.php/clientbookingv5/login",

      headers: {
        secretkey: "OX5AecW9vZw",

        clientid: "896042",

        "Content-Type":
          "application/json",

        Accept: "application/json",

        "User-Agent":
          "Mozilla/5.0",
      },

      data: payload,
    });

    console.log("SUCCESS:");

    console.log(response.data);
  } catch (error) {
    console.log("STATUS:");

    console.log(error.response?.status);

    console.log("ERROR RESPONSE:");

    console.log(error.response?.data);

    console.log("FULL ERROR:");

    console.log(error.message);
  }
}

testLogin();