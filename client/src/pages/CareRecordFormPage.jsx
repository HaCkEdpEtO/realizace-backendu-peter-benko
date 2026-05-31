import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { careRecordApi, plantApi } from "../api.js";

const emptyForm = {
  plantId: "",
  performedAt: "",
  careType: "watering",
  note: ""
};

function CareRecordFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [plantList, setPlantList] = useState([]);
  const [form, setForm] = useState({
    ...emptyForm,
    plantId: searchParams.get("plantId") || ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const plantDtoOut = await plantApi.list();
        setPlantList(plantDtoOut.itemList || []);

        if (isEditMode) {
          const careRecordDtoOut = await careRecordApi.get(id);

          setForm({
            plantId: careRecordDtoOut.plantId || "",
            performedAt: careRecordDtoOut.performedAt || "",
            careType: careRecordDtoOut.careType || "watering",
            note: careRecordDtoOut.note || ""
          });
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const dtoIn = {
        plantId: form.plantId,
        performedAt: form.performedAt,
        careType: form.careType,
        note: form.note.trim()
      };

      if (isEditMode) {
        await careRecordApi.update({ id, ...dtoIn });
      } else {
        await careRecordApi.create(dtoIn);
      }

      navigate("/care-records");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="info-message">Načítavam formulár...</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{isEditMode ? "Upraviť záznam starostlivosti" : "Pridať záznam starostlivosti"}</h2>
          <p>
            {isEditMode
              ? "Úprava existujúceho záznamu starostlivosti."
              : "Vytvorenie nového záznamu starostlivosti k vybranej rastline."}
          </p>
        </div>

        <Link className="button" to="/care-records">
          Späť
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Rastlina
          <select name="plantId" value={form.plantId} onChange={handleChange} required>
            <option value="">Vyber rastlinu</option>
            {plantList.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Dátum vykonania
          <input
            name="performedAt"
            type="date"
            value={form.performedAt}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Typ starostlivosti
          <select name="careType" value={form.careType} onChange={handleChange} required>
            <option value="watering">Polievanie</option>
            <option value="fertilizing">Hnojenie</option>
            <option value="repotting">Presádzanie</option>
            <option value="pruning">Strihanie</option>
            <option value="other">Iné</option>
          </select>
        </label>

        <label>
          Poznámka
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            maxLength={500}
            rows={4}
          />
        </label>

        <button className="button primary" type="submit" disabled={saving}>
          {saving ? "Ukladám..." : "Uložiť"}
        </button>
      </form>
    </section>
  );
}

export default CareRecordFormPage;