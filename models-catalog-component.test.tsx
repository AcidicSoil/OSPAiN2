import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelsCatalog from "./models-catalog-component";

// Mock sample data
const mockModels = [
  {
    id: "1",
    name: "jina-embeddings-v2",
    version: "2.0.0",
    releaseDate: "2024-01-15",
    description: "State-of-the-art text embeddings model",
    type: "embeddings",
    metrics: {
      accuracy: 0.92,
      latency: 15,
      throughput: 1000,
    },
    publication: {
      title: "Jina Embeddings: Advanced Neural Search Embeddings",
      authors: ["Smith, J.", "Johnson, A."],
      url: "https://example.com/paper",
    },
  },
  {
    id: "2",
    name: "jina-clip-v3",
    version: "3.0.0",
    releaseDate: "2024-02-20",
    description: "Multi-modal CLIP model for image-text understanding",
    type: "clip",
    metrics: {
      accuracy: 0.89,
      latency: 25,
      throughput: 800,
    },
    publication: {
      title: "Jina CLIP: Bridging Vision and Language",
      authors: ["Brown, R.", "Davis, M."],
      url: "https://example.com/paper2",
    },
  },
];

// Mock the useTimelinePositioning hook
jest.mock("./useTimelinePositioning", () => ({
  __esModule: true,
  default: () => ({
    positions: mockModels.map((model, index) => ({
      id: model.id,
      left: index * 200,
      top: 100,
    })),
  }),
}));

describe("ModelsCatalog", () => {
  beforeEach(() => {
    render(<ModelsCatalog initialModels={mockModels} />);
  });

  test("renders the catalog header", () => {
    expect(screen.getByText("Jina AI Models")).toBeInTheDocument();
    expect(
      screen.getByText(/Explore our search foundation models/i)
    ).toBeInTheDocument();
  });

  test("displays all model cards initially", () => {
    expect(screen.getByText("jina-embeddings-v2")).toBeInTheDocument();
    expect(screen.getByText("jina-clip-v3")).toBeInTheDocument();
  });

  test("filters models by search input", async () => {
    const searchInput = screen.getByPlaceholderText("Search models...");
    await userEvent.type(searchInput, "embeddings");

    await waitFor(() => {
      expect(screen.getByText("jina-embeddings-v2")).toBeInTheDocument();
      expect(screen.queryByText("jina-clip-v3")).not.toBeInTheDocument();
    });
  });

  test("filters models by type", async () => {
    const typeFilter = screen.getByLabelText("Filter by type");
    await userEvent.selectOptions(typeFilter, "clip");

    await waitFor(() => {
      expect(screen.queryByText("jina-embeddings-v2")).not.toBeInTheDocument();
      expect(screen.getByText("jina-clip-v3")).toBeInTheDocument();
    });
  });

  test("opens detail panel when clicking a model card", async () => {
    const modelCard = screen.getByText("jina-embeddings-v2");
    fireEvent.click(modelCard);

    await waitFor(() => {
      expect(screen.getByText("Technical Specifications")).toBeInTheDocument();
      expect(screen.getByText("Accuracy: 92%")).toBeInTheDocument();
      expect(screen.getByText("Latency: 15ms")).toBeInTheDocument();
    });
  });

  test("closes detail panel when clicking close button", async () => {
    // Open the panel first
    const modelCard = screen.getByText("jina-embeddings-v2");
    fireEvent.click(modelCard);

    // Find and click the close button
    const closeButton = screen.getByLabelText("Close panel");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Technical Specifications")
      ).not.toBeInTheDocument();
    });
  });

  test("displays timeline labels correctly", () => {
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  test("handles empty search results gracefully", async () => {
    const searchInput = screen.getByPlaceholderText("Search models...");
    await userEvent.type(searchInput, "nonexistent model");

    await waitFor(() => {
      expect(screen.getByText("No models found")).toBeInTheDocument();
    });
  });

  test("displays publication information in detail panel", async () => {
    const modelCard = screen.getByText("jina-embeddings-v2");
    fireEvent.click(modelCard);

    await waitFor(() => {
      expect(
        screen.getByText("Jina Embeddings: Advanced Neural Search Embeddings")
      ).toBeInTheDocument();
      expect(screen.getByText("Smith, J., Johnson, A.")).toBeInTheDocument();
    });
  });

  test("maintains filter state when toggling detail panel", async () => {
    // Apply filter
    const searchInput = screen.getByPlaceholderText("Search models...");
    await userEvent.type(searchInput, "embeddings");

    // Open and close detail panel
    const modelCard = screen.getByText("jina-embeddings-v2");
    fireEvent.click(modelCard);
    const closeButton = screen.getByLabelText("Close panel");
    fireEvent.click(closeButton);

    // Verify filter is still applied
    expect(screen.getByText("jina-embeddings-v2")).toBeInTheDocument();
    expect(screen.queryByText("jina-clip-v3")).not.toBeInTheDocument();
  });
});
