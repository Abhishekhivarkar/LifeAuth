export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      next(); 

    } catch (error) {
      console.error("ROLE MIDDLEWARE ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };
};