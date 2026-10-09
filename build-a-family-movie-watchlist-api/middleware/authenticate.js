import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "grading-secret-value"
    );
    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token."
    });
  }
}
