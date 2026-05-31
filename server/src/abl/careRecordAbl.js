const plantDao = require("../dao/plantDao");
const careRecordDao = require("../dao/careRecordDao");
const { AppError } = require("../utils/appError");
const { validateDto } = require("../utils/validation");
const { isValidDateString } = require("../utils/dateHelper");

const {
  careRecordListDtoInType,
  careRecordGetDtoInType,
  careRecordCreateDtoInType,
  careRecordUpdateDtoInType,
  careRecordDeleteDtoInType
} = require("../schemas/careRecordSchemas");

function validatePerformedAt(performedAt) {
  if (!isValidDateString(performedAt)) {
    throw new AppError("invalidPerformedAt", "PerformedAt must be a valid date in format YYYY-MM-DD.", 400, {
      performedAt
    });
  }
}

function validatePlantExists(plantId) {
  const plant = plantDao.get(plantId);

  if (!plant) {
    throw new AppError("plantDoesNotExist", "Plant does not exist.", 404, {
      plantId
    });
  }
}

function list(dtoIn = {}) {
  validateDto(careRecordListDtoInType, dtoIn);

  if (dtoIn.plantId) {
    validatePlantExists(dtoIn.plantId);
  }

  return {
    itemList: careRecordDao.list(dtoIn),
    uuAppErrorMap: {}
  };
}

function get(dtoIn) {
  validateDto(careRecordGetDtoInType, dtoIn);

  const careRecord = careRecordDao.get(dtoIn.id);

  if (!careRecord) {
    throw new AppError("careRecordDoesNotExist", "Care record does not exist.", 404, {
      id: dtoIn.id
    });
  }

  return {
    ...careRecord,
    uuAppErrorMap: {}
  };
}

function create(dtoIn) {
  validateDto(careRecordCreateDtoInType, dtoIn);
  validatePerformedAt(dtoIn.performedAt);
  validatePlantExists(dtoIn.plantId);

  const createdCareRecord = careRecordDao.create(dtoIn);

  return {
    ...createdCareRecord,
    uuAppErrorMap: {}
  };
}

function update(dtoIn) {
  validateDto(careRecordUpdateDtoInType, dtoIn);
  validatePerformedAt(dtoIn.performedAt);
  validatePlantExists(dtoIn.plantId);

  const careRecord = careRecordDao.get(dtoIn.id);

  if (!careRecord) {
    throw new AppError("careRecordDoesNotExist", "Care record does not exist.", 404, {
      id: dtoIn.id
    });
  }

  const updatedCareRecord = careRecordDao.update(dtoIn);

  return {
    ...updatedCareRecord,
    uuAppErrorMap: {}
  };
}

function remove(dtoIn) {
  validateDto(careRecordDeleteDtoInType, dtoIn);

  const careRecord = careRecordDao.get(dtoIn.id);

  if (!careRecord) {
    throw new AppError("careRecordDoesNotExist", "Care record does not exist.", 404, {
      id: dtoIn.id
    });
  }

  const deletedCareRecord = careRecordDao.remove(dtoIn.id);

  return {
    deletedCareRecord,
    uuAppErrorMap: {}
  };
}

module.exports = {
  list,
  get,
  create,
  update,
  remove
};
