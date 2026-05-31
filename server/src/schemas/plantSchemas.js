const plantGetDtoInType = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 }
  },
  required: ["id"],
  additionalProperties: false
};

const plantCreateDtoInType = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    location: { type: "string", minLength: 1, maxLength: 100 },
    wateringIntervalDays: { type: "integer", minimum: 1, maximum: 365 },
    note: { type: "string", maxLength: 500 }
  },
  required: ["name", "location", "wateringIntervalDays"],
  additionalProperties: false
};

const plantUpdateDtoInType = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1, maxLength: 100 },
    location: { type: "string", minLength: 1, maxLength: 100 },
    wateringIntervalDays: { type: "integer", minimum: 1, maximum: 365 },
    note: { type: "string", maxLength: 500 }
  },
  required: ["id", "name", "location", "wateringIntervalDays"],
  additionalProperties: false
};

const plantDeleteDtoInType = plantGetDtoInType;

module.exports = {
  plantGetDtoInType,
  plantCreateDtoInType,
  plantUpdateDtoInType,
  plantDeleteDtoInType
};
