import React, { useState, useEffect, useRef } from "react";
import "./ModelsCatalog.css";
import useTimelinePositioning from "./useTimelinePositioning";

// Define types for our models
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
  type:
    | "embeddings"
    | "clip"
    | "reader"
    | "reranker"
    | "classifier"
    | "segmenter";
  metrics: ModelMetrics;
  useCases: string[];
  publication?: Publication;
  documentationUrl: string;
}

// Sample data
const sampleModels: Model[] = [
  {
    id: "jina-embeddings-v3",
    name: "jina-embeddings",
    version: "v3",
    releaseDate: "2024-09-18",
    description:
      "A frontier multilingual text embedding model with 570M parameters and 8192 token-length, outperforming the latest proprietary embeddings from OpenAI and Cohere on MTEB.",
    shortDescription: "Frontier multilingual text embedding model",
    type: "embeddings",
    metrics: {
      parameterCount: "570M",
      contextLength: 8192,
      languages: 89,
      performanceScore: 67.8,
    },
    useCases: ["Text search", "Information retrieval", "Semantic similarity"],
    publication: {
      title: "jina-embeddings-v3: Multilingual Embeddings With Task LoRA",
      url: "https://arxiv.org/abs/example",
      publisher: "ECIR 2025",
      date: "2024-09-18",
    },
    documentationUrl: "https://jina.ai/embeddings/",
  },
  {
    id: "jina-clip-v2",
    name: "jina-clip",
    version: "v2",
    releaseDate: "2024-12-12",
    description:
      "A 0.9B CLIP-style model that brings three major advances: multilingual support for 89 languages, high image resolution at 512x512, and Matryoshka representation learning for truncated embeddings.",
    shortDescription: "Multilingual multimodal embeddings for text and images",
    type: "clip",
    metrics: {
      parameterCount: "0.9B",
      contextLength: 8192,
      languages: 89,
      performanceScore: 65.3,
    },
    useCases: [
      "Image search",
      "Cross-modal retrieval",
      "Zero-shot classification",
    ],
    publication: {
      title:
        "jina-clip-v2: Multilingual Multimodal Embeddings for Text and Images",
      url: "https://arxiv.org/abs/example2",
      publisher: "arXiv",
      date: "2024-12-12",
    },
    documentationUrl: "https://jina.ai/clip/",
  },
  {
    id: "jina-colbert-v2",
    name: "jina-colbert",
    version: "v2",
    releaseDate: "2024-08-30",
    description:
      "A general-purpose multilingual late interaction retriever designed for high-precision information retrieval across multiple languages.",
    shortDescription: "Multilingual late interaction retriever",
    type: "reranker",
    metrics: {
      parameterCount: "330M",
      contextLength: 4096,
      languages: 75,
      performanceScore: 63.2,
    },
    useCases: ["High-precision search", "Re-ranking", "Passage retrieval"],
    publication: {
      title:
        "Jina-ColBERT-v2: A General-Purpose Multilingual Late Interaction Retriever",
      url: "https://arxiv.org/abs/example3",
      publisher: "EMNLP 2024",
      date: "2024-08-30",
    },
    documentationUrl: "https://jina.ai/reranker/",
  },
  {
    id: "readerlm-v2",
    name: "readerlm",
    version: "v2",
    releaseDate: "2025-03-04",
    description:
      "Small language model specialized for HTML to Markdown and JSON conversion, designed for efficient web content processing.",
    shortDescription: "HTML to Markdown conversion model",
    type: "reader",
    metrics: {
      parameterCount: "1.5B",
      contextLength: 16384,
      languages: 25,
      performanceScore: 59.7,
    },
    useCases: ["Web scraping", "Content extraction", "Document processing"],
    publication: {
      title: "ReaderLM-v2: Small Language Model for HTML to Markdown and JSON",
      url: "https://arxiv.org/abs/example4",
      publisher: "arXiv",
      date: "2025-03-04",
    },
    documentationUrl: "https://jina.ai/reader/",
  },
];

// Component for the filter controls
const FilterControls: React.FC<{
  onFilterChange: (filters: { type?: string; search?: string }) => void;
}> = ({ onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [modelType, setModelType] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onFilterChange({ type: modelType, search: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModelType(e.target.value);
    onFilterChange({ type: e.target.value, search });
  };

  return (
    <div className="filter-controls">
      <div className="search-input">
        <input
          type="text"
          placeholder="Filter by model name..."
          value={search}
          onChange={handleSearchChange}
        />
        {search && (
          <button
            className="clear-search"
            onClick={() => {
              setSearch("");
              onFilterChange({ type: modelType, search: "" });
            }}
          >
            ×
          </button>
        )}
      </div>
      <div className="filter-dropdowns">
        <select value={modelType} onChange={handleTypeChange}>
          <option value="">All model types</option>
          <option value="embeddings">Embeddings</option>
          <option value="clip">CLIP</option>
          <option value="reader">Reader</option>
          <option value="reranker">Reranker</option>
          <option value="classifier">Classifier</option>
          <option value="segmenter">Segmenter</option>
        </select>
      </div>
    </div>
  );
};

// Model card component
const ModelCard: React.FC<{
  model: Model;
  isSelected: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}> = ({ model, isSelected, onClick, style }) => {
  return (
    <div
      className={`model-card ${isSelected ? "selected" : ""} type-${
        model.type
      }`}
      onClick={onClick}
      style={style}
    >
      <div className="model-icon">
        {/* Icon would be dependent on model type */}
        <div className={`icon-${model.type}`}></div>
      </div>
      <div className="model-header">
        <h3>{model.name}</h3>
        <span className="version-tag">{model.version}</span>
      </div>
      <p className="model-description">{model.shortDescription}</p>
      <div className="model-meta">
        <span className="parameter-count">{model.metrics.parameterCount}</span>
        <span className="context-length">
          {model.metrics.contextLength} tokens
        </span>
        <span className="languages">{model.metrics.languages} languages</span>
      </div>
      <div className="model-date">
        {new Date(model.releaseDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })}
      </div>
    </div>
  );
};

// Detailed model panel component
const ModelDetailPanel: React.FC<{
  model: Model | null;
  onClose: () => void;
}> = ({ model, onClose }) => {
  if (!model) return null;

  return (
    <div className="model-detail-panel">
      <div className="panel-header">
        <div className="header-content">
          <h2>{model.name}</h2>
          <span className="version-tag">{model.version}</span>
          <span className="release-date">
            Released:{" "}
            {new Date(model.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="panel-content">
        <section className="description-section">
          <h3>Description</h3>
          <p>{model.description}</p>
        </section>
        <section className="metrics-section">
          <h3>Technical Specifications</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Parameters</span>
              <span className="metric-value">
                {model.metrics.parameterCount}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Context Length</span>
              <span className="metric-value">
                {model.metrics.contextLength} tokens
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Languages</span>
              <span className="metric-value">{model.metrics.languages}</span>
            </div>
            {model.metrics.performanceScore && (
              <div className="metric">
                <span className="metric-label">MTEB Score</span>
                <span className="metric-value">
                  {model.metrics.performanceScore}
                </span>
              </div>
            )}
          </div>
        </section>
        <section className="use-cases-section">
          <h3>Use Cases</h3>
          <ul className="use-cases-list">
            {model.useCases.map((useCase, index) => (
              <li key={index} className="use-case-item">
                {useCase}
              </li>
            ))}
          </ul>
        </section>
        {model.publication && (
          <section className="publication-section">
            <h3>Research</h3>
            <div className="publication-card">
              <h4>{model.publication.title}</h4>
              <div className="publication-meta">
                <span>{model.publication.publisher}</span>
                <span>{model.publication.date}</span>
              </div>
              <a
                href={model.publication.url}
                target="_blank"
                rel="noopener noreferrer"
                className="publication-link"
              >
                Read Paper
              </a>
            </div>
          </section>
        )}
        <section className="documentation-section">
          <h3>Documentation</h3>
          <a
            href={model.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-button"
          >
            View Documentation
          </a>
        </section>
      </div>
    </div>
  );
};

// Generate time period labels for the timeline
const generateTimeLabels = (models: Model[]): string[] => {
  if (models.length === 0) return [];

  // Find the earliest and latest dates
  const dates = models.map((model) => new Date(model.releaseDate).getTime());
  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));

  // Get years covering the timeline
  const startYear = earliestDate.getFullYear();
  const endYear = latestDate.getFullYear();

  // Create array of years
  const years: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }

  return years;
};

// Main component
const ModelsCatalog: React.FC = () => {
  const [models, setModels] = useState<Model[]>(sampleModels);
  const [filteredModels, setFilteredModels] = useState<Model[]>(sampleModels);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generate timeline labels
  const timeLabels = generateTimeLabels(models);

  // Get dynamic positioning for timeline items
  const cardPositions = useTimelinePositioning(
    filteredModels,
    timelineRef as React.RefObject<HTMLElement>,
    {
      verticalLanes: 4,
      verticalSpacing: 100,
      horizontalPadding: 10,
    }
  );

  useEffect(() => {
    // This would be replaced by an actual API call in a real implementation
    setModels(sampleModels);
    setFilteredModels(sampleModels);
  }, []);

  const handleFilterChange = (filters: { type?: string; search?: string }) => {
    let filtered = [...models];

    if (filters.type) {
      filtered = filtered.filter((model) => model.type === filters.type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(searchLower) ||
          model.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredModels(filtered);
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    // Add a class to the body to prevent scrolling when panel is open
    document.body.classList.add("detail-panel-open");
  };

  const handleClosePanel = () => {
    setSelectedModel(null);
    document.body.classList.remove("detail-panel-open");
  };

  return (
    <div className="models-catalog">
      <div className="catalog-header">
        <h1>Our Search Foundation Models</h1>
        <p className="subtitle">
          Explore our frontier models for high-quality enterprise search and RAG
          systems.
        </p>
      </div>

      <FilterControls onFilterChange={handleFilterChange} />

      <div className="timeline-container" ref={timelineRef}>
        <div className="timeline-axis">
          {timeLabels.map((year) => (
            <div key={year} className="timeline-tick">
              <div className="tick-mark"></div>
              <div className="tick-label">{year}</div>
            </div>
          ))}
        </div>

        <div className="models-timeline">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={selectedModel?.id === model.id}
              onClick={() => handleModelSelect(model)}
              style={
                cardPositions[model.id]
                  ? {
                      left: cardPositions[model.id].left,
                      top: cardPositions[model.id].top,
                    }
                  : undefined
              }
            />
          ))}

          {filteredModels.length === 0 && (
            <div className="no-results">
              <p>
                No models match your current filters. Try adjusting your search
                criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedModel && (
        <>
          <div className="backdrop" onClick={handleClosePanel}></div>
          <ModelDetailPanel model={selectedModel} onClose={handleClosePanel} />
        </>
      )}
    </div>
  );
};

export default ModelsCatalog;
