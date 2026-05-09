# Plant Care App - Backend

Backend for BCAA Homework assignment Backend (#3).

The application stores two related entities:

- Plant
- CareRecord

The backend is implemented in Node.js + Express.js and stores data in JSON files.

## Repository structure

```bash
server/
  data/
    plants.json
    careRecords.json
  src/
    index.js
  package.json
```

## Run locally

```bash
cd server
npm install
npm run dev
```

## The backend runs on:

```bash
http://localhost:3000
```

## Check syntax

```bash
cd server
npm run check
```

## Data storage

The backend uses JSON files as a simple persistent data storage:

```bash
server/data/plants.json
server/data/careRecords.json
```

## Health check

```bash
GET /health
```

## Plant endpoints

```bash
GET  /plant/list
GET  /plant/get?id={id}
POST /plant/create
POST /plant/update
POST /plant/delete
```

## CareRecord endpoints

```bash
GET  /careRecord/list
GET  /careRecord/list?plantId={plantId}
GET  /careRecord/get?id={id}
POST /careRecord/create
POST /careRecord/update
POST /careRecord/delete
```

## Example URLs

```bash
http://localhost:3000/health
http://localhost:3000/plant/list
http://localhost:3000/plant/get?id=plant-monstera
http://localhost:3000/careRecord/list
http://localhost:3000/careRecord/list?plantId=plant-monstera
http://localhost:3000/careRecord/get?id=care-monstera-1
```