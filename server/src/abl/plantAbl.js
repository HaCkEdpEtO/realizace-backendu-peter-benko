const plantDao = require("../dao/plantDao");
const careRecordDao = require("../dao/careRecordDao");
const { AppError } = require("../utils/appError");
const { validateDto } = require("../utils/validation");
const { todayString, addDays } = require("../utils/dateHelper");

const {
  plantGetDtoInType,
  plantCreateDtoInType,
  plantUpdateDtoInType,
  plantDeleteDtoInType
} = require("../schemas/plantSchemas");

function calculateWateringStatus(plant, careRecordList) {
  const wateringRecordList = careRecordList
    .filter((careRecord) => careRecord.plantId === plant.id && careRecord.careType === "watering")
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));

  const lastWateringDate = wateringRecordList.length > 0 ? wateringRecordList[0].performedAt : null;

  if (!lastWateringDate) {
    return {
      lastWateringDate: null,
      nextWateringDate: null,
      needsWatering: true
    };
  }

  const nextWateringDate = addDays(lastWateringDate, plant.wateringIntervalDays);

  return {
    lastWateringDate,
    nextWateringDate,
    needsWatering: nextWateringDate <= todayString()
  };
}

function addCalculatedData(plant, careRecordList) {
  return {
    ...plant,
    wateringStatus: calculateWateringStatus(plant, careRecordList)
  };
}

function list() {
  const plantList = plantDao.list();
  const careRecordList = careRecordDao.list();

  return {
    itemList: plantList.map((plant) => addCalculatedData(plant, careRecordList)),
    uuAppErrorMap: {}
  };
}

function get(dtoIn) {
  validateDto(plantGetDtoInType, dtoIn);

  const plant = plantDao.get(dtoIn.id);

  if (!plant) {
    throw new AppError("plantDoesNotExist", "Plant does not exist.", 404, {
      id: dtoIn.id
    });
  }

  const careRecordList = careRecordDao.list({ plantId: plant.id });

  return {
    ...addCalculatedData(plant, careRecordList),
    careRecordList,
    uuAppErrorMap: {}
  };
}

function create(dtoIn) {
  validateDto(plantCreateDtoInType, dtoIn);

  const createdPlant = plantDao.create(dtoIn);

  return {
    ...addCalculatedData(createdPlant, []),
    uuAppErrorMap: {}
  };
}

function update(dtoIn) {
  validateDto(plantUpdateDtoInType, dtoIn);

  const plant = plantDao.get(dtoIn.id);

  if (!plant) {
    throw new AppError("plantDoesNotExist", "Plant does not exist.", 404, {
      id: dtoIn.id
    });
  }

  const updatedPlant = plantDao.update(dtoIn);
  const careRecordList = careRecordDao.list({ plantId: updatedPlant.id });

  return {
    ...addCalculatedData(updatedPlant, careRecordList),
    uuAppErrorMap: {}
  };
}

function remove(dtoIn) {
  validateDto(plantDeleteDtoInType, dtoIn);

  const plant = plantDao.get(dtoIn.id);

  if (!plant) {
    throw new AppError("plantDoesNotExist", "Plant does not exist.", 404, {
      id: dtoIn.id
    });
  }

  const deletedCareRecordList = careRecordDao.deleteByPlantId(dtoIn.id);
  const deletedPlant = plantDao.remove(dtoIn.id);

  return {
    deletedPlant,
    deletedCareRecordList,
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
