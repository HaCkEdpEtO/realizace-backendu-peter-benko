import { Link } from "react-router-dom";
import PlantCard from "./PlantCard.jsx";

function PlantListView({ plantList, loading, error, onDelete }) {
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

      {!loading && !error && plantList.length > 0 && (
        <div className="card-grid">
          {plantList.map((plant) => (
            <PlantCard key={plant.id} plant={plant} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PlantListView;