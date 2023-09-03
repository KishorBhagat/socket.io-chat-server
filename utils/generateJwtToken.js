const jwt = require('jsonwebtoken');

const generateJwtToken = (payload, expiry) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: expiry});
}

module.exports = generateJwtToken;