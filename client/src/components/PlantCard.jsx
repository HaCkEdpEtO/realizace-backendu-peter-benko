import { Link } from "react-router-dom";

function PlantCard({ plant, onDelete }) {
  return (
    <article className="card">
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
        <button className="button danger" type="button" onClick={() => onDelete(plant.id)}>
          Vymazať
        </button>
      </div>
    </article>
  );
}

export default PlantCard;