class AppError extends Error {
  constructor(code, message, status = 400, paramMap = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.paramMap = paramMap;
  }
}

module.exports = {
  AppError
};
