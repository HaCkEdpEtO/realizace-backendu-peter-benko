function errorHandler(error, req, res, next) {
  if (error.status && error.code) {
    return res.status(error.status).json({
      uuAppErrorMap: {
        [error.code]: {
          type: "error",
          message: error.message,
          paramMap: error.paramMap || {}
        }
      }
    });
  }

  console.error(error);

  return res.status(500).json({
    uuAppErrorMap: {
      internalServerError: {
        type: "error",
        message: "Unexpected server error.",
        paramMap: {}
      }
    }
  });
}

module.exports = errorHandler;
