const datePattern = "^\\d{4}-\\d{2}-\\d{2}$";

const careRecordListDtoInType = {
  type: "object",
  properties: {
    plantId: { type: "string", minLength: 1 }
  },
  additionalProperties: false
};

const careRecordGetDtoInType = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 }
  },
  required: ["id"],
  additionalProperties: false
};

const careRecordCreateDtoInType = {
  type: "object",
  properties: {
    plantId: { type: "string", minLength: 1 },
    performedAt: { type: "string", pattern: datePattern },
    careType: {
      type: "string",
      enum: ["watering", "fertilizing", "repotting", "pruning", "other"]
    },
    note: { type: "string", maxLength: 500 }
  },
  required: ["plantId", "performedAt", "careType"],
  additionalProperties: false
};

const careRecordUpdateDtoInType = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    plantId: { type: "string", minLength: 1 },
    performedAt: { type: "string", pattern: datePattern },
    careType: {
      type: "string",
      enum: ["watering", "fertilizing", "repotting", "pruning", "other"]
    },
    note: { type: "string", maxLength: 500 }
  },
  required: ["id", "plantId", "performedAt", "careType"],
  additionalProperties: false
};

const careRecordDeleteDtoInType = careRecordGetDtoInType;

module.exports = {
  careRecordListDtoInType,
  careRecordGetDtoInType,
  careRecordCreateDtoInType,
  careRecordUpdateDtoInType,
  careRecordDeleteDtoInType
};
