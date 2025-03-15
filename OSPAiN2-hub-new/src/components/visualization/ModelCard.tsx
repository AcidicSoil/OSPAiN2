import React from "react";
import "./ModelCard.css";

interface Publication {
  title: string;
  url: string;
  publisher: string;
  date: string;
}

interface ModelMetrics {
  parameterCount: string;
  contextLength: number;
  languages: number;
  performanceScore?: number;
}

interface Model {
  id: string;
  name: string;
  version: string;
  releaseDate: string;
  description: string;
  shortDescription: string;
  type: string;
  metrics: ModelMetrics;
  useCases: string[];
  publication?: Publication;
  documentationUrl: string;
}

interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected,
  onClick,
  style,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <button
      className={`model-card ${isSelected ? "selected" : ""} type-${
        model.type
      }`}
      onClick={onClick}
      style={style}
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="model-icon" data-testid="model-icon">
        <span className={`icon-${model.type}`} />
      </div>
      <div className="model-content">
        <div className="model-header">
          <h3 className="model-name">{model.name}</h3>
          <span className="model-version">{model.version}</span>
        </div>
        <p className="model-description">{model.shortDescription}</p>
        <div className="model-metrics">
          <span className="metric">
            <strong>{model.metrics.parameterCount}</strong> parameters
          </span>
          <span className="metric">
            <strong>{model.metrics.contextLength}</strong> tokens
          </span>
          <span className="metric">
            <strong>{model.metrics.languages}</strong> languages
          </span>
          {model.metrics.performanceScore && (
            <span className="metric">
              <strong>{model.metrics.performanceScore}</strong> score
            </span>
          )}
        </div>
        <div className="model-footer">
          <span className="release-date">{formatDate(model.releaseDate)}</span>
        </div>
      </div>
    </button>
  );
};

export default ModelCard; 