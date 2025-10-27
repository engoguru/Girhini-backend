
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken"

export function authorization(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized! No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //  console.log(decoded,"jgprjgoijhggoijeroerfoiear")
      req.user = decoded; // attach user info to request
      next(); // move to next middleware or route handler
  
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
export function verifyRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized! Token missing or invalid." });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next(); // user role is valid, continue
  };
}
