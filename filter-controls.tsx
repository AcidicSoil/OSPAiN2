import React, { useState, useCallback } from "react";
import "./filter-controls.css";

interface FilterControlsProps {
  onFilterChange: (filters: { type: string; search: string }) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearch = e.target.value;
      setSearch(newSearch);
      onFilterChange({ type, search: newSearch });
    },
    [type, onFilterChange]
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value;
      setType(newType);
      onFilterChange({ type: newType, search });
    },
    [search, onFilterChange]
  );

  const handleClearSearch = useCallback(() => {
    setSearch("");
    onFilterChange({ type, search: "" });
  }, [type, onFilterChange]);

  return (
    <div className="filter-controls">
      <div className="search-container">
        <input
          type="text"
          placeholder="Filter by model name..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search models"
        />
        {search && (
          <button
            onClick={handleClearSearch}
            className="clear-button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <select
        value={type}
        onChange={handleTypeChange}
        className="type-select"
        aria-label="Filter by model type"
      >
        <option value="">All Types</option>
        <option value="embeddings">Embeddings</option>
        <option value="clip">CLIP</option>
        <option value="text">Text</option>
        <option value="vision">Vision</option>
      </select>
    </div>
  );
};

export default FilterControls;
