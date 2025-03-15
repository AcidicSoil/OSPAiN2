import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelsCatalog from "./ModelsCatalog";

// Mock useTimelinePositioning hook
jest.mock("./useTimelinePositioning", () => {
  return {
    __esModule: true,
    default: () => ({
      "jina-embeddings-v3": { left: "10%", top: "0px" },
      "jina-clip-v2": { left: "40%", top: "180px" },
      "jina-colbert-v2": { left: "70%", top: "80px" },
      "readerlm-v2": { left: "85%", top: "220px" },
    }),
  };
});

describe("ModelsCatalog", () => {
  beforeEach(() => {
    render(<ModelsCatalog />);
  });

  test("renders the catalog header", () => {
    expect(screen.getByText("Our Search Foundation Models")).toBeInTheDocument();
    expect(
      screen.getByText(/Explore our frontier models for high-quality enterprise search/i)
    ).toBeInTheDocument();
  });

  test("displays all model cards initially", () => {
    expect(screen.getByText("jina-embeddings")).toBeInTheDocument();
    expect(screen.getByText("jina-clip")).toBeInTheDocument();
    expect(screen.getByText("jina-colbert")).toBeInTheDocument();
    expect(screen.getByText("readerlm")).toBeInTheDocument();
  });

  test("filters models by search input", async () => {
    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "embeddings");

    await waitFor(() => {
      expect(screen.getByText("jina-embeddings")).toBeInTheDocument();
      expect(screen.queryByText("jina-clip")).not.toBeInTheDocument();
    });
  });

  test("filters models by type", async () => {
    const typeFilter = screen.getByRole("combobox");
    await userEvent.selectOptions(typeFilter, "clip");

    await waitFor(() => {
      expect(screen.queryByText("jina-embeddings")).not.toBeInTheDocument();
      expect(screen.getByText("jina-clip")).toBeInTheDocument();
    });
  });

  test("opens detail panel when clicking a model card", async () => {
    const modelCard = screen.getByText("jina-embeddings").closest("button");
    fireEvent.click(modelCard!);

    await waitFor(() => {
      expect(screen.getByText("Technical Specifications")).toBeInTheDocument();
      expect(screen.getByText("570M")).toBeInTheDocument();
      expect(screen.getByText("8192 tokens")).toBeInTheDocument();
    });
  });

  test("closes detail panel when clicking close button", async () => {
    // Open the panel first
    const modelCard = screen.getByText("jina-embeddings").closest("button");
    fireEvent.click(modelCard!);

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
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  test("handles empty search results gracefully", async () => {
    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "nonexistent model");

    await waitFor(() => {
      expect(screen.getByText(/No models match your current filters/i)).toBeInTheDocument();
    });
  });

  test("displays publication information in detail panel", async () => {
    const modelCard = screen.getByText("jina-embeddings").closest("button");
    fireEvent.click(modelCard!);

    await waitFor(() => {
      expect(
        screen.getByText("jina-embeddings-v3: Multilingual Embeddings With Task LoRA")
      ).toBeInTheDocument();
      expect(screen.getByText("ECIR 2025")).toBeInTheDocument();
    });
  });

  test("maintains filter state when toggling detail panel", async () => {
    // Apply filter
    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "embeddings");

    // Open and close detail panel
    const modelCard = screen.getByText("jina-embeddings").closest("button");
    fireEvent.click(modelCard!);
    const closeButton = screen.getByLabelText("Close panel");
    fireEvent.click(closeButton);

    // Verify filter is still applied
    expect(screen.getByText("jina-embeddings")).toBeInTheDocument();
    expect(screen.queryByText("jina-clip")).not.toBeInTheDocument();
  });
}); 