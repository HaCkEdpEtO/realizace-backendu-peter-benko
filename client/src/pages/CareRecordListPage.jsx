/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { careRecordApi, plantApi } from "../api.js";
import { getCareTypeLabel } from "../careTypeLabels.js";

function CareRecordListPage() {
  const [plantList, setPlantList] = useState([]);
  const [careRecordList, setCareRecordList] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const plantNameMap = useMemo(() => {
    return plantList.reduce((map, plant) => {
      map[plant.id] = plant.name;
      return map;
    }, {});
  }, [plantList]);

  async function loadCareRecords(plantId = selectedPlantId) {
    try {
      setLoading(true);
      setError("");

      const [plantDtoOut, careRecordDtoOut] = await Promise.all([
        plantApi.list(),
        careRecordApi.list(plantId || undefined)
      ]);

      setPlantList(plantDtoOut.itemList || []);
      setCareRecordList(careRecordDtoOut.itemList || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Naozaj chceš vymazať tento záznam starostlivosti?");

    if (!confirmed) return;

    try {
      await careRecordApi.delete(id);
      await loadCareRecords();
    } catch (error) {
      setError(error.message);
    }
  }

  function handlePlantFilterChange(event) {
    const plantId = event.target.value;
    setSelectedPlantId(plantId);
    loadCareRecords(plantId);
  }

  useEffect(() => {
    loadCareRecords("");
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Záznamy starostlivosti</h2>
          <p>Prehľad polievania, hnojenia a ďalších aktivít vykonaných pri rastlinách.</p>
        </div>

        <Link className="button primary" to="/care-records/new">
          ➕ Pridať záznam
        </Link>
      </div>

      <div className="filter-card">
        <label>
          Filtrovať podľa rastliny
          <select value={selectedPlantId} onChange={handlePlantFilterChange}>
            <option value="">Všetky rastliny</option>
            {plantList.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="info-message">Načítavam záznamy starostlivosti...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && careRecordList.length === 0 && (
        <p className="info-message">Zatiaľ nie je evidovaný žiadny záznam starostlivosti.</p>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Dátum</th>
              <th>Rastlina</th>
              <th>Typ</th>
              <th>Poznámka</th>
              <th className="actions-column">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {careRecordList.map((careRecord) => (
              <tr key={careRecord.id}>
                <td>{careRecord.performedAt}</td>
                <td>{plantNameMap[careRecord.plantId] || careRecord.plantId}</td>
                <td>{getCareTypeLabel(careRecord.careType)}</td>
                <td>{careRecord.note || "Bez poznámky."}</td>
                <td className="actions-column">
                  <div className="button-row">
                    <Link className="button" to={`/care-records/${careRecord.id}/edit`}>
                      Upraviť
                    </Link>
                    <button className="button danger" type="button" onClick={() => handleDelete(careRecord.id)}>
                      Vymazať
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CareRecordListPage;