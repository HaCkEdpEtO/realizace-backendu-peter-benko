/* eslint-disable react-hooks/set-state-in-effect */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { plantApi } from "../api.js";

function PlantListPage() {
  const [plantList, setPlantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPlants() {
    try {
      setLoading(true);
      setError("");

      const dtoOut = await plantApi.list();
      setPlantList(dtoOut.itemList || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Naozaj chceš vymazať túto rastlinu?");

    if (!confirmed) return;

    try {
      await plantApi.delete(id);
      await loadPlants();
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    loadPlants();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Rastliny</h2>
          <p>Prehľad všetkých evidovaných rastlín a ich aktuálneho stavu polievania.</p>
        </div>

        <Link className="button primary" to="/plants/new">
          ➕ Pridať rastlinu
        </Link>
      </div>

      {loading && <p className="info-message">Načítavam rastliny...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && plantList.length === 0 && (
        <p className="info-message">Zatiaľ nie je evidovaná žiadna rastlina.</p>
      )}

      <div className="card-grid">
        {plantList.map((plant) => (
          <article className="card" key={plant.id}>
            <div className="card-header">
              <h3>{plant.name}</h3>
              <span className={plant.wateringStatus?.needsWatering ? "badge warning" : "badge success"}>
                {plant.wateringStatus?.needsWatering ? "Treba poliať" : "V poriadku"}
              </span>
            </div>

            <p>
              <strong>Umiestnenie:</strong> {plant.location}
            </p>
            <p>
              <strong>Interval polievania:</strong> {plant.wateringIntervalDays} dní
            </p>
            <p>
              <strong>Ďalšie polievanie:</strong>{" "}
              {plant.wateringStatus?.nextWateringDate || "Nie je vypočítané"}
            </p>
            <p>{plant.note || "Bez poznámky."}</p>

            <div className="button-row">
              <Link className="button" to={`/plants/${plant.id}`}>
                Detail
              </Link>
              <Link className="button" to={`/plants/${plant.id}/edit`}>
                Upraviť
              </Link>
              <button className="button danger" type="button" onClick={() => handleDelete(plant.id)}>
                Vymazať
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PlantListPage;