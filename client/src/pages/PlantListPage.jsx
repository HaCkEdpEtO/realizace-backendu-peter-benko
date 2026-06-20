/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { plantApi } from "../api.js";
import PlantListView from "../components/PlantListView.jsx";

function PlantListPage() {
  const [plantList, setPlantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlants = useCallback(async () => {
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
  }, []);

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
  }, [loadPlants]);

  return (
    <PlantListView
      plantList={plantList}
      loading={loading}
      error={error}
      onDelete={handleDelete}
    />
  );
}

export default PlantListPage;