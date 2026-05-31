const crypto = require("crypto");
const { PLANTS_FILE } = require("../config");
const { readJsonList, writeJsonList } = require("./jsonDao");

function list() {
  return readJsonList(PLANTS_FILE);
}

function get(id) {
  return list().find((plant) => plant.id === id) || null;
}

function create(plant) {
  const itemList = list();
  const now = new Date().toISOString();

  const newPlant = {
    id: crypto.randomUUID(),
    name: plant.name,
    location: plant.location,
    wateringIntervalDays: plant.wateringIntervalDays,
    note: plant.note || "",
    createdAt: now,
    updatedAt: now
  };

  itemList.push(newPlant);
  writeJsonList(PLANTS_FILE, itemList);

  return newPlant;
}

function update(plant) {
  const itemList = list();
  const index = itemList.findIndex((item) => item.id === plant.id);

  if (index === -1) {
    return null;
  }

  const originalPlant = itemList[index];

  const updatedPlant = {
    ...originalPlant,
    name: plant.name,
    location: plant.location,
    wateringIntervalDays: plant.wateringIntervalDays,
    note: plant.note || "",
    updatedAt: new Date().toISOString()
  };

  itemList[index] = updatedPlant;
  writeJsonList(PLANTS_FILE, itemList);

  return updatedPlant;
}

function remove(id) {
  const itemList = list();
  const index = itemList.findIndex((plant) => plant.id === id);

  if (index === -1) {
    return null;
  }

  const deletedPlant = itemList[index];
  itemList.splice(index, 1);
  writeJsonList(PLANTS_FILE, itemList);

  return deletedPlant;
}

module.exports = {
  list,
  get,
  create,
  update,
  remove
};
