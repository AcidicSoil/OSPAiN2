import React, { useEffect } from "react";
import "./model-detail-panel.css";

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

interface ModelDetailPanelProps {
  model: Model | null;
  onClose: () => void;
}

const ModelDetailPanel: React.FC<ModelDetailPanelProps> = ({
  model,
  onClose,
}) => {
  useEffect(() => {
    if (model) {
      document.body.classList.add("detail-panel-open");
    }

    return () => {
      document.body.classList.remove("detail-panel-open");
    };
  }, [model]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (model) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [model, onClose]);

  if (!model) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="detail-panel-backdrop"
      data-testid="backdrop"
      onClick={onClose}
    >
      <div
        className="detail-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="panel-title"
        aria-describedby="panel-description"
      >
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close panel"
        >
          ×
        </button>
        <div className="panel-header">
          <h2 id="panel-title">{model.name}</h2>
          <span className="model-version">{model.version}</span>
        </div>
        <div className="panel-content" id="panel-description">
          <div className="release-info">
            Released: {formatDate(model.releaseDate)}
          </div>
          <p className="description">{model.description}</p>

          <section className="specifications">
            <h3>Technical Specifications</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Parameters</span>
                <span className="metric-value">
                  {model.metrics.parameterCount}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Context Length</span>
                <span className="metric-value">
                  {model.metrics.contextLength} tokens
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Languages</span>
                <span className="metric-value">{model.metrics.languages}</span>
              </div>
              {model.metrics.performanceScore && (
                <div className="metric-item">
                  <span className="metric-label">Performance Score</span>
                  <span className="metric-value">
                    {model.metrics.performanceScore}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="use-cases">
            <h3>Use Cases</h3>
            <ul>
              {model.useCases.map((useCase, index) => (
                <li key={index}>{useCase}</li>
              ))}
            </ul>
          </section>

          {model.publication && (
            <section className="research">
              <h3>Research</h3>
              <div className="publication-info">
                <h4>{model.publication.title}</h4>
                <p>
                  {model.publication.publisher} • {model.publication.date}
                </p>
                <a
                  href={model.publication.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-link"
                >
                  Read Paper
                </a>
              </div>
            </section>
          )}

          <div className="panel-footer">
            <a
              href={model.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="docs-link"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPanel;
