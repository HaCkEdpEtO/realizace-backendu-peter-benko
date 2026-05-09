const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const Ajv = require("ajv");

const app = express();
const ajv = new Ajv({ allErrors: true, coerceTypes: true });

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "../data");
const PLANTS_FILE = path.join(DATA_DIR, "plants.json");
const CARE_RECORDS_FILE = path.join(DATA_DIR, "careRecords.json");

app.use(cors());
app.use(express.json());

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PLANTS_FILE)) fs.writeFileSync(PLANTS_FILE, "[]", "utf8");
  if (!fs.existsSync(CARE_RECORDS_FILE)) fs.writeFileSync(CARE_RECORDS_FILE, "[]", "utf8");
}

function readJsonList(filePath) {
  ensureDataFiles();
  const content = fs.readFileSync(filePath, "utf8");
  if (!content.trim()) return [];
  return JSON.parse(content);
}

function writeJsonList(filePath, itemList) {
  ensureDataFiles();
  fs.writeFileSync(filePath, JSON.stringify(itemList, null, 2), "utf8");
}

function appError(code, message, status = 400, paramMap = {}) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.paramMap = paramMap;
  return error;
}

function invalidDtoInParamMap(errors = []) {
  const invalidTypeKeyMap = {};
  const invalidValueKeyMap = {};
  const missingKeyMap = {};

  for (const error of errors) {
    const key = error.instancePath
      ? error.instancePath.replace(/^\//, "")
      : error.params?.missingProperty;

    if (error.keyword === "required") {
      missingKeyMap[error.params.missingProperty] = error.message;
    } else if (error.keyword === "type") {
      invalidTypeKeyMap[key] = error.message;
    } else {
      invalidValueKeyMap[key || error.keyword] = error.message;
    }
  }

  return { invalidTypeKeyMap, invalidValueKeyMap, missingKeyMap };
}

function sanitizeDtoIn(dtoIn = {}, allowedKeys = []) {
  const sanitizedDtoIn = {};
  const unsupportedKeyList = [];

  Object.keys(dtoIn || {}).forEach((key) => {
    if (allowedKeys.includes(key)) {
      sanitizedDtoIn[key] = dtoIn[key];
    } else {
      unsupportedKeyList.push(key);
    }
  });

  return { sanitizedDtoIn, warnings: { unsupportedKeyList } };
}

function validateDtoIn(dtoIn, schema) {
  const allowedKeys = Object.keys(schema.properties || {});
  const { sanitizedDtoIn, warnings } = sanitizeDtoIn(dtoIn, allowedKeys);

  const validate = ajv.compile(schema);
  const valid = validate(sanitizedDtoIn);

  if (!valid) {
    throw appError(
      "invalidDtoIn",
      "DtoIn is not valid.",
      400,
      invalidDtoInParamMap(validate.errors)
    );
  }

  return { dtoIn: sanitizedDtoIn, warnings };
}

function warningMap(warnings = {}) {
  const uuAppErrorMap = {};

  if (warnings.unsupportedKeyList && warnings.unsupportedKeyList.length > 0) {
    uuAppErrorMap.unsupportedKeys = {
      type: "warning",
      message: "DtoIn contains unsupported keys.",
      paramMap: { unsupportedKeyList: warnings.unsupportedKeyList }
    };
  }

  return uuAppErrorMap;
}

function withWarnings(dtoOut, warnings) {
  return {
    ...dtoOut,
    uuAppErrorMap: warningMap(warnings)
  };
}

function toDateOnly(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function isFutureDate(dateString) {
  const date = toDateOnly(dateString);
  if (!date) return false;
  return date.getTime() > todayDateOnly().getTime();
}

function addDays(dateString, days) {
  const date = toDateOnly(dateString);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function diffDaysFromToday(dateString) {
  const date = toDateOnly(dateString);
  if (!date) return null;
  const diffMs = todayDateOnly().getTime() - date.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function computeWateringStatus(plant, careRecordList) {
  const wateringRecords = careRecordList
    .filter((record) => record.plantId === plant.id && record.careType === "watering")
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));

  const lastWateringDate = wateringRecords[0]?.performedAt || null;

  if (!lastWateringDate) {
    return {
      lastWateringDate: null,
      nextWateringDate: null,
      needsWatering: true
    };
  }

  const daysSinceLastWatering = diffDaysFromToday(lastWateringDate);
  const nextWateringDate = addDays(lastWateringDate, plant.wateringIntervalDays);

  return {
    lastWateringDate,
    nextWateringDate,
    needsWatering: daysSinceLastWatering >= plant.wateringIntervalDays
  };
}

const plantDao = {
  create(plant) {
    const plantList = readJsonList(PLANTS_FILE);

    const newPlant = {
      id: crypto.randomUUID(),
      ...plant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    plantList.push(newPlant);
    writeJsonList(PLANTS_FILE, plantList);

    return newPlant;
  },

  get(id) {
    return readJsonList(PLANTS_FILE).find((plant) => plant.id === id) || null;
  },

  list(filter = {}) {
    let plantList = readJsonList(PLANTS_FILE);

    if (filter.location) {
      plantList = plantList.filter((plant) =>
        plant.location.toLowerCase().includes(filter.location.toLowerCase())
      );
    }

    return plantList.sort((a, b) => a.name.localeCompare(b.name));
  },

  update(plant) {
    const plantList = readJsonList(PLANTS_FILE);
    const index = plantList.findIndex((item) => item.id === plant.id);

    if (index === -1) return null;

    const updatedPlant = {
      ...plantList[index],
      ...plant,
      id: plantList[index].id,
      createdAt: plantList[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    plantList[index] = updatedPlant;
    writeJsonList(PLANTS_FILE, plantList);

    return updatedPlant;
  },

  delete(id) {
    const plantList = readJsonList(PLANTS_FILE);
    const index = plantList.findIndex((plant) => plant.id === id);

    if (index === -1) return null;

    const [deletedPlant] = plantList.splice(index, 1);
    writeJsonList(PLANTS_FILE, plantList);

    return deletedPlant;
  }
};

const careRecordDao = {
  create(careRecord) {
    const careRecordList = readJsonList(CARE_RECORDS_FILE);

    const newCareRecord = {
      id: crypto.randomUUID(),
      ...careRecord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    careRecordList.push(newCareRecord);
    writeJsonList(CARE_RECORDS_FILE, careRecordList);

    return newCareRecord;
  },

  get(id) {
    return readJsonList(CARE_RECORDS_FILE).find((record) => record.id === id) || null;
  },

  list(filter = {}) {
    let careRecordList = readJsonList(CARE_RECORDS_FILE);

    if (filter.plantId) {
      careRecordList = careRecordList.filter((record) => record.plantId === filter.plantId);
    }

    if (filter.careType) {
      careRecordList = careRecordList.filter((record) => record.careType === filter.careType);
    }

    return careRecordList.sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  },

  update(careRecord) {
    const careRecordList = readJsonList(CARE_RECORDS_FILE);
    const index = careRecordList.findIndex((item) => item.id === careRecord.id);

    if (index === -1) return null;

    const updatedCareRecord = {
      ...careRecordList[index],
      ...careRecord,
      id: careRecordList[index].id,
      createdAt: careRecordList[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    careRecordList[index] = updatedCareRecord;
    writeJsonList(CARE_RECORDS_FILE, careRecordList);

    return updatedCareRecord;
  },

  delete(id) {
    const careRecordList = readJsonList(CARE_RECORDS_FILE);
    const index = careRecordList.findIndex((record) => record.id === id);

    if (index === -1) return null;

    const [deletedCareRecord] = careRecordList.splice(index, 1);
    writeJsonList(CARE_RECORDS_FILE, careRecordList);

    return deletedCareRecord;
  },

  deleteByPlantId(plantId) {
    const careRecordList = readJsonList(CARE_RECORDS_FILE);
    const remainingList = careRecordList.filter((record) => record.plantId !== plantId);
    const deletedList = careRecordList.filter((record) => record.plantId === plantId);

    writeJsonList(CARE_RECORDS_FILE, remainingList);

    return deletedList;
  }
};

const plantCreateSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    location: { type: "string", minLength: 1, maxLength: 100 },
    wateringIntervalDays: { type: "integer", minimum: 1, maximum: 365 },
    note: { type: "string", maxLength: 500 }
  },
  required: ["name", "location", "wateringIntervalDays"]
};

const plantGetSchema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 }
  },
  required: ["id"]
};

const plantListSchema = {
  type: "object",
  properties: {
    location: { type: "string", minLength: 1 },
    needsWatering: { type: "boolean" }
  }
};

const plantUpdateSchema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1, maxLength: 100 },
    location: { type: "string", minLength: 1, maxLength: 100 },
    wateringIntervalDays: { type: "integer", minimum: 1, maximum: 365 },
    note: { type: "string", maxLength: 500 }
  },
  required: ["id"]
};

const careTypeEnum = ["watering", "fertilizing", "other"];

const careRecordCreateSchema = {
  type: "object",
  properties: {
    plantId: { type: "string", minLength: 1 },
    performedAt: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    careType: { type: "string", enum: careTypeEnum },
    note: { type: "string", maxLength: 500 }
  },
  required: ["plantId", "performedAt", "careType"]
};

const careRecordGetSchema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 }
  },
  required: ["id"]
};

const careRecordListSchema = {
  type: "object",
  properties: {
    plantId: { type: "string", minLength: 1 },
    careType: { type: "string", enum: careTypeEnum }
  }
};

const careRecordUpdateSchema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    plantId: { type: "string", minLength: 1 },
    performedAt: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    careType: { type: "string", enum: careTypeEnum },
    note: { type: "string", maxLength: 500 }
  },
  required: ["id"]
};

function enrichPlant(plant) {
  const careRecordList = careRecordDao.list({ plantId: plant.id });

  return {
    ...plant,
    wateringStatus: computeWateringStatus(plant, careRecordList)
  };
}

function assertPlantExists(plantId) {
  if (!plantId) return;

  const plant = plantDao.get(plantId);

  if (!plant) {
    throw appError("plantDoesNotExist", "Plant does not exist.", 404, { plantId });
  }
}

function assertPerformedAtIsNotFuture(performedAt) {
  if (performedAt && isFutureDate(performedAt)) {
    throw appError("futureDateNotAllowed", "Performed date cannot be in the future.", 400, {
      performedAt
    });
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "plant-care-backend" });
});

app.post("/plant/create", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.body, plantCreateSchema);

    const plant = plantDao.create({
      ...dtoIn,
      note: dtoIn.note || ""
    });

    res.json(withWarnings(enrichPlant(plant), warnings));
  } catch (error) {
    next(error);
  }
});

app.get("/plant/get", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.query, plantGetSchema);
    const plant = plantDao.get(dtoIn.id);

    if (!plant) {
      throw appError("plantDoesNotExist", "Plant does not exist.", 404, { id: dtoIn.id });
    }

    const careRecordList = careRecordDao.list({ plantId: plant.id });

    res.json(
      withWarnings(
        {
          ...enrichPlant(plant),
          careRecordList
        },
        warnings
      )
    );
  } catch (error) {
    next(error);
  }
});

app.get("/plant/list", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.query, plantListSchema);

    let itemList = plantDao.list({ location: dtoIn.location }).map(enrichPlant);

    if (dtoIn.needsWatering !== undefined) {
      itemList = itemList.filter(
        (plant) => plant.wateringStatus.needsWatering === dtoIn.needsWatering
      );
    }

    res.json(withWarnings({ itemList }, warnings));
  } catch (error) {
    next(error);
  }
});

app.post("/plant/update", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.body, plantUpdateSchema);

    const existingPlant = plantDao.get(dtoIn.id);

    if (!existingPlant) {
      throw appError("plantDoesNotExist", "Plant does not exist.", 404, { id: dtoIn.id });
    }

    const updatedPlant = plantDao.update(dtoIn);

    res.json(withWarnings(enrichPlant(updatedPlant), warnings));
  } catch (error) {
    next(error);
  }
});

app.post("/plant/delete", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.body, plantGetSchema);

    const deletedPlant = plantDao.delete(dtoIn.id);

    if (!deletedPlant) {
      throw appError("plantDoesNotExist", "Plant does not exist.", 404, { id: dtoIn.id });
    }

    const deletedCareRecordList = careRecordDao.deleteByPlantId(dtoIn.id);

    res.json(withWarnings({ deletedPlant, deletedCareRecordList }, warnings));
  } catch (error) {
    next(error);
  }
});

app.post("/careRecord/create", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.body, careRecordCreateSchema);

    assertPlantExists(dtoIn.plantId);
    assertPerformedAtIsNotFuture(dtoIn.performedAt);

    const careRecord = careRecordDao.create({
      ...dtoIn,
      note: dtoIn.note || ""
    });

    res.json(withWarnings(careRecord, warnings));
  } catch (error) {
    next(error);
  }
});

app.get("/careRecord/get", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.query, careRecordGetSchema);
    const careRecord = careRecordDao.get(dtoIn.id);

    if (!careRecord) {
      throw appError("careRecordDoesNotExist", "Care record does not exist.", 404, {
        id: dtoIn.id
      });
    }

    res.json(withWarnings(careRecord, warnings));
  } catch (error) {
    next(error);
  }
});

app.get("/careRecord/list", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.query, careRecordListSchema);

    if (dtoIn.plantId) {
      assertPlantExists(dtoIn.plantId);
    }

    const itemList = careRecordDao.list(dtoIn);

    res.json(withWarnings({ itemList }, warnings));
  } catch (error) {
    next(error);
  }
});

app.post("/careRecord/update", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.body, careRecordUpdateSchema);

    const existingCareRecord = careRecordDao.get(dtoIn.id);

    if (!existingCareRecord) {
      throw appError("careRecordDoesNotExist", "Care record does not exist.", 404, {
        id: dtoIn.id
      });
    }

    if (dtoIn.plantId) {
      assertPlantExists(dtoIn.plantId);
    }

    assertPerformedAtIsNotFuture(dtoIn.performedAt);

    const updatedCareRecord = careRecordDao.update(dtoIn);

    res.json(withWarnings(updatedCareRecord, warnings));
  } catch (error) {
    next(error);
  }
});

app.post("/careRecord/delete", (req, res, next) => {
  try {
    const { dtoIn, warnings } = validateDtoIn(req.body, careRecordGetSchema);

    const deletedCareRecord = careRecordDao.delete(dtoIn.id);

    if (!deletedCareRecord) {
      throw appError("careRecordDoesNotExist", "Care record does not exist.", 404, {
        id: dtoIn.id
      });
    }

    res.json(withWarnings({ deletedCareRecord }, warnings));
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    uuAppErrorMap: {
      routeDoesNotExist: {
        type: "error",
        message: "Route does not exist.",
        paramMap: {
          method: req.method,
          url: req.originalUrl
        }
      }
    }
  });
});

app.use((error, req, res, next) => {
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
});

ensureDataFiles();

app.listen(PORT, () => {
  console.log(`Plant Care backend is running on http://localhost:${PORT}`);
});
