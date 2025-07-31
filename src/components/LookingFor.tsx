import React from "react";

type Option = {
  label: string;
  id: string;
};

type Props = {
  value: string;
  onChange: (categoryId: string) => void;
};

const options: Option[] = [
  { label: "Gas Station", id: "19009" },
  { label: "Spa", id: "19027" },
  { label: "Grocery Store", id: "17069" },
  { label: "Gym", id: "18023" },
  { label: "General Store", id: "17118" },
  { label: "Pharmacy", id: "17077" },
  { label: "Shoe Store", id: "17094" },
];

const LookingFor: React.FC<Props> = ({ value, onChange }) => (
  <div style={{ width: "100%", margin: "16px 0" }}>
    <label>
      What are you looking for?{" "}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 8 }}
      >
        {options.map((opt) => (
          <option value={opt.id} key={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  </div>
);

export default LookingFor;
