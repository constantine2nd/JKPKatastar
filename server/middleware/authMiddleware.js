import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).send({ message: "Not logged in. No authorization token." });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).send({ message: "User not found." });
    }

    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send({ message: "Token expired." });
    }
    return res.status(401).send({ message: "Not authorized, token failed." });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).send({ message: "Forbidden: insufficient permissions." });
  }
  next();
};

export { protect, requireRole };
