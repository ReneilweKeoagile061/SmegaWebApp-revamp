// authMiddleware.js
export const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;
  
    if (!token) {
      // If no token, redirect to login
      return res.redirect('/');
    }
  
    // Optionally: Add logic to verify the token here if needed (e.g., JWT verification)
    
    next(); // Proceed to the next middleware/route if authenticated
  };
  