
const jwt = require("jsonwebtoken");
const getUserEmailFromJwtToken = (token) => {
  jwt.verify(
    token,
    "Jjjjjpokaoijajoaonioaajabuhauabuhabu",
    function (err, decoded) {
      return decoded.email;
    }
  );
};
module.exports = getUserEmailFromJwtToken;
