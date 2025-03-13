import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterControls from "./filter-controls";

describe("FilterControls", () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  test("renders search input and type filter dropdown", () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    expect(
      screen.getByPlaceholderText("Filter by model name...")
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("handles search input changes", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "test model");

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "",
      search: "test model",
    });
  });

  test("handles type filter changes", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const typeSelect = screen.getByRole("combobox");
    await userEvent.selectOptions(typeSelect, "embeddings");

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "embeddings",
      search: "",
    });
  });

  test("clears search input when clear button is clicked", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "test model");

    const clearButton = screen.getByRole("button");
    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "",
      search: "",
    });
  });

  test("combines search and type filters", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    const typeSelect = screen.getByRole("combobox");

    await userEvent.type(searchInput, "test model");
    await userEvent.selectOptions(typeSelect, "embeddings");

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "embeddings",
      search: "test model",
    });
  });

  test("maintains filter state when switching between filters", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    const typeSelect = screen.getByRole("combobox");

    // Set search filter
    await userEvent.type(searchInput, "test model");

    // Set type filter
    await userEvent.selectOptions(typeSelect, "embeddings");

    // Update search filter
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, "new search");

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "embeddings",
      search: "new search",
    });
  });

  test("handles keyboard navigation", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    const typeSelect = screen.getByRole("combobox");

    // Tab navigation
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);

    fireEvent.keyDown(searchInput, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(typeSelect);

    // Enter key in type select
    fireEvent.keyDown(typeSelect, { key: "Enter" });
    expect(typeSelect).toHaveFocus();
  });

  test("handles empty search input gracefully", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "   ");

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "",
      search: "   ",
    });
  });

  test("handles special characters in search input", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    await userEvent.type(searchInput, "test@#$%^&*()");

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "",
      search: "test@#$%^&*()",
    });
  });

  test("handles rapid filter changes", async () => {
    render(<FilterControls onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText("Filter by model name...");
    const typeSelect = screen.getByRole("combobox");

    // Rapidly change filters
    await userEvent.type(searchInput, "test");
    await userEvent.selectOptions(typeSelect, "embeddings");
    await userEvent.type(searchInput, " model");
    await userEvent.selectOptions(typeSelect, "clip");

    // Verify the final state
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: "clip",
      search: "test model",
    });
  });
});
