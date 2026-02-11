const isAuthenticated = (req, res, next) => {
    // Check both session.user and passport's isAuthenticated method
    if (req.session.user || (req.isAuthenticated && req.isAuthenticated())) {
        return next();
    }
    
    return res.status(401).json({
        success: false,
        message: "You do not have access!"
    });
};

module.exports = {
    isAuthenticated
};