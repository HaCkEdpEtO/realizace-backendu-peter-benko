export const CARE_TYPE_OPTIONS = [
  { value: "watering", label: "Polievanie" },
  { value: "fertilizing", label: "Hnojenie" },
  { value: "repotting", label: "Presádzanie" },
  { value: "pruning", label: "Strihanie" },
  { value: "other", label: "Iné" }
];

export function getCareTypeLabel(careType) {
  return CARE_TYPE_OPTIONS.find((option) => option.value === careType)?.label || careType || "Neznámy typ";
}