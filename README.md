# Plant Care App

Plant Care App is a simple application for managing house plants and their care records.

The application was created for BCAA Homework assignments Backend (#3) and Frontend (#4).

## Application entities

The application stores two related entities:

- Plant
- CareRecord

A plant can have multiple care records. Care records are used mainly for watering, fertilizing, repotting, pruning and other plant care activities.

## Technology stack

Backend:

- Node.js
- Express.js
- JSON files as simple persistent data storage

Frontend:

- React
- Vite
- React Router

## Repository structure

```bash
client/
  src/
    pages/
    constants/
    api.js
    App.jsx
  package.json

server/
  data/
    plants.json
    careRecords.json
  src/
    index.js
  package.json
```
## Run backend

```bash
cd server
npm install
npm run dev
```

## Backend runs on:

```bash
http://localhost:3000
Run frontend
cd client
npm install
npm run dev
```

## Frontend runs on:

```bash
http://localhost:5173
```

## Checks

Backend syntax check:

```bash
cd server
npm run check
```

Frontend lint and build:

```bash
cd client
npm run lint
npm run build
```

## Frontend routes

```bash
/                         redirects to /plants
/plants                   plant list
/plants/new               create plant
/plants/:id               plant detail
/plants/:id/edit          update plant
/care-records             care record list
/care-records/new         create care record
/care-records/:id/edit    update care record
```

## Backend endpoints
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

## Data storage

Backend stores data in JSON files:

```bash
server/data/plants.json
server/data/careRecords.json
```
