import React, { useState, useEffect, useRef, useMemo } from "react";
import "./ModelsCatalog.css";
import useTimelinePositioning from "./useTimelinePositioning";
import ModelCard from "./ModelCard";
import ModelDetailPanel from "./ModelDetailPanel";
import { Breadcrumbs } from "../common";
import Pagination from "../common/Pagination";

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
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 models per page

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredModels]);

  // Paginate the filtered models
  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredModels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredModels, currentPage, itemsPerPage]);

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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of catalog when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="models-catalog">
      {/* Add breadcrumbs */}
      <div className="models-catalog-header">
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Models', path: '/models' }
          ]}
          className="models-catalog-breadcrumbs"
        />
        <h1>Models Catalog</h1>
        <FilterControls onFilterChange={handleFilterChange} />
      </div>

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
          {paginatedModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              position={cardPositions[index]}
              onClick={() => handleModelSelect(model)}
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

      {/* Add pagination */}
      {filteredModels.length > itemsPerPage && (
        <div className="models-catalog-pagination-container">
          <Pagination
            totalItems={filteredModels.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="models-catalog-pagination"
          />
        </div>
      )}

      {selectedModel && (
        <ModelDetailPanel 
          model={selectedModel} 
          onClose={handleClosePanel} 
        />
      )}
    </div>
  );
};

export default ModelsCatalog; 