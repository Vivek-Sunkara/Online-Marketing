const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, "secret");
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authMiddleware };
