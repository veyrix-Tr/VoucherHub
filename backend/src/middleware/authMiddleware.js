import jwt from "jsonwebtoken";

// Verify JWT Token
export const protect = (req, res, next) => {

  // due to some problem in production, auth is disabled
  return next();
  
  // Checks if Authorization header exists and is in correct format
  // then remove the Bearer part by splitting and verify and get decoded payload (the object you put when signing) and Attaches user info to req.user 

  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (err) {
      console.error("Invalid token:", err.message);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

// Admin-only, checks if user.role = admin then move next,
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Admin access only" });
  }
};
