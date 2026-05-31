import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import PlantListPage from "./pages/PlantListPage.jsx";
import PlantDetailPage from "./pages/PlantDetailPage.jsx";
import PlantFormPage from "./pages/PlantFormPage.jsx";
import CareRecordListPage from "./pages/CareRecordListPage.jsx";
import CareRecordFormPage from "./pages/CareRecordFormPage.jsx";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1><span className="app-logo">🌿</span> Plant Care App</h1>
          <p>Jednoduchá aplikácia na evidenciu rastlín a záznamov starostlivosti.</p>
        </div>

        <nav className="navigation">
          <NavLink to="/plants">🌱 Rastliny</NavLink>
          <NavLink to="/care-records">📝 Záznamy starostlivosti</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/plants" replace />} />

          <Route path="/plants" element={<PlantListPage />} />
          <Route path="/plants/new" element={<PlantFormPage />} />
          <Route path="/plants/:id" element={<PlantDetailPage />} />
          <Route path="/plants/:id/edit" element={<PlantFormPage />} />

          <Route path="/care-records" element={<CareRecordListPage />} />
          <Route path="/care-records/new" element={<CareRecordFormPage />} />
          <Route path="/care-records/:id/edit" element={<CareRecordFormPage />} />

          <Route path="*" element={<Navigate to="/plants" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;