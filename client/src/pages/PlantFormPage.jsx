import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { plantApi } from "../api.js";

const emptyForm = {
  name: "",
  location: "",
  wateringIntervalDays: 7,
  note: ""
};

function PlantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlant() {
      if (!isEditMode) return;

      try {
        setLoading(true);
        setError("");

        const dtoOut = await plantApi.get(id);

        setForm({
          name: dtoOut.name || "",
          location: dtoOut.location || "",
          wateringIntervalDays: dtoOut.wateringIntervalDays || 7,
          note: dtoOut.note || ""
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlant();
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === "wateringIntervalDays" ? Number(value) : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const dtoIn = {
        name: form.name.trim(),
        location: form.location.trim(),
        wateringIntervalDays: Number(form.wateringIntervalDays),
        note: form.note.trim()
      };

      if (isEditMode) {
        await plantApi.update({ id, ...dtoIn });
      } else {
        await plantApi.create(dtoIn);
      }

      navigate("/plants");
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
          <h2>{isEditMode ? "Upraviť rastlinu" : "Pridať rastlinu"}</h2>
          <p>{isEditMode ? "Úprava existujúcej rastliny." : "Vytvorenie novej rastliny v evidencii."}</p>
        </div>

        <Link className="button" to="/plants">
          Späť
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Názov rastliny
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          Umiestnenie
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          Interval polievania v dňoch
          <input
            name="wateringIntervalDays"
            type="number"
            min={1}
            max={365}
            value={form.wateringIntervalDays}
            onChange={handleChange}
            required
          />
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

export default PlantFormPage;