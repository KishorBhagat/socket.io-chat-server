const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ error: {name: "User unauthorized", message: "Please authenticate using a valid token"} });
    }
    if (token.startsWith("Bearer")) {
        try {
            token = token.split(" ")[1];
            const data = jwt.verify(token, process.env.JWT_SECRET);
            req.user = data.user;
            next();
        } catch (error) {
            console.log(error)
            return res.status(401).json({ error });
        }
    }
    else {
        return res.json({ error: { message: "need a Bearer token" } });
    }
}

module.exports = authUser;