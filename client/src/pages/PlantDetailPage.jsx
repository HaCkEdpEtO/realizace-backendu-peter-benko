import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { plantApi } from "../api.js";
import { getCareTypeLabel } from "../careTypeLabels.js";

function PlantDetailPage() {
  const { id } = useParams();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlant() {
      try {
        setLoading(true);
        setError("");

        const dtoOut = await plantApi.get(id);
        setPlant(dtoOut);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlant();
  }, [id]);

  if (loading) return <p className="info-message">Načítavam detail rastliny...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!plant) return <p className="info-message">Rastlina nebola nájdená.</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{plant.name}</h2>
          <p>Detail rastliny a súvisiace záznamy starostlivosti.</p>
        </div>

        <div className="button-row">
          <Link className="button" to="/plants">
            Späť
          </Link>
          <Link className="button primary" to={`/plants/${plant.id}/edit`}>
            Upraviť
          </Link>
        </div>
      </div>

      <article className="card detail-card">
        <p>
          <strong>Umiestnenie:</strong> {plant.location}
        </p>
        <p>
          <strong>Interval polievania:</strong> {plant.wateringIntervalDays} dní
        </p>
        <p>
          <strong>Posledné polievanie:</strong>{" "}
          {plant.wateringStatus?.lastWateringDate || "Zatiaľ bez záznamu"}
        </p>
        <p>
          <strong>Ďalšie polievanie:</strong>{" "}
          {plant.wateringStatus?.nextWateringDate || "Nie je vypočítané"}
        </p>
        <p>
          <strong>Stav:</strong>{" "}
          {plant.wateringStatus?.needsWatering ? "Rastlinu treba poliať." : "Rastlina je v poriadku."}
        </p>
        <p>
          <strong>Poznámka:</strong> {plant.note || "Bez poznámky."}
        </p>
      </article>

      <div className="page-header small">
        <div>
          <h3>Záznamy starostlivosti</h3>
          <p>História vykonanej starostlivosti o túto rastlinu.</p>
        </div>

        <Link className="button primary" to={`/care-records/new?plantId=${plant.id}`}>
          Pridať záznam
        </Link>
      </div>

      {plant.careRecordList?.length === 0 && (
        <p className="info-message">Táto rastlina zatiaľ nemá žiadny záznam starostlivosti.</p>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Dátum</th>
              <th>Typ</th>
              <th>Poznámka</th>
            </tr>
          </thead>
          <tbody>
            {(plant.careRecordList || []).map((careRecord) => (
              <tr key={careRecord.id}>
                <td>{careRecord.performedAt}</td>
                <td>{getCareTypeLabel(careRecord.careType)}</td>
                <td>{careRecord.note || "Bez poznámky."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PlantDetailPage;