const Ajv = require("ajv");
const { AppError } = require("./appError");

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true
});

function validateDto(schema, dtoIn) {
  const validate = ajv.compile(schema);
  const isValid = validate(dtoIn);

  if (!isValid) {
    throw new AppError("invalidDtoIn", "DtoIn is not valid.", 400, {
      validationErrorList: validate.errors
    });
  }

  return dtoIn;
}

module.exports = {
  validateDto
};
