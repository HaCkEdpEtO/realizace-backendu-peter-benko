const { AppError } = require("../utils/appError");

function notFoundRoute(req, res, next) {
  next(new AppError("routeDoesNotExist", "Route does not exist.", 404, {
    method: req.method,
    url: req.originalUrl
  }));
}

module.exports = notFoundRoute;
