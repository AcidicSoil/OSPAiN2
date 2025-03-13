import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelCard from "./model-card";

const mockModel = {
  id: "test-model",
  name: "Test Model",
  version: "v1.0.0",
  releaseDate: "2024-01-01",
  description: "A test model for testing purposes",
  shortDescription: "Test model",
  type: "embeddings",
  metrics: {
    parameterCount: "100M",
    contextLength: 2048,
    languages: 10,
    performanceScore: 85.5,
  },
  useCases: ["Text search", "Information retrieval"],
  publication: {
    title: "Test Paper",
    url: "https://example.com/paper",
    publisher: "Test Publisher",
    date: "2024-01-01",
  },
  documentationUrl: "https://example.com/docs",
};

describe("ModelCard", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test("renders model information correctly", () => {
    render(
      <ModelCard model={mockModel} isSelected={false} onClick={mockOnClick} />
    );

    expect(screen.getByText("Test Model")).toBeInTheDocument();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
    expect(screen.getByText("Test model")).toBeInTheDocument();
    expect(screen.getByText("100M")).toBeInTheDocument();
    expect(screen.getByText("2048 tokens")).toBeInTheDocument();
    expect(screen.getByText("10 languages")).toBeInTheDocument();
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
  });

  test("applies selected state styling when isSelected is true", () => {
    render(
      <ModelCard model={mockModel} isSelected={true} onClick={mockOnClick} />
    );

    const card = screen.getByRole("button");
    expect(card).toHaveClass("selected");
  });

  test("calls onClick handler when clicked", async () => {
    render(
      <ModelCard model={mockModel} isSelected={false} onClick={mockOnClick} />
    );

    const card = screen.getByRole("button");
    await userEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("applies correct type-specific styling", () => {
    render(
      <ModelCard model={mockModel} isSelected={false} onClick={mockOnClick} />
    );

    const card = screen.getByRole("button");
    expect(card).toHaveClass("type-embeddings");
  });

  test("displays model icon correctly", () => {
    render(
      <ModelCard model={mockModel} isSelected={false} onClick={mockOnClick} />
    );

    const icon = screen.getByTestId("model-icon");
    expect(icon).toHaveClass("icon-embeddings");
  });

  test("handles keyboard navigation", async () => {
    render(
      <ModelCard model={mockModel} isSelected={false} onClick={mockOnClick} />
    );

    const card = screen.getByRole("button");

    // Focus the card
    card.focus();
    expect(document.activeElement).toBe(card);

    // Press Enter
    fireEvent.keyDown(card, { key: "Enter" });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // Press Space
    fireEvent.keyDown(card, { key: " " });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  test("applies custom style prop when provided", () => {
    const customStyle = {
      left: "50%",
      top: "100px",
    };

    render(
      <ModelCard
        model={mockModel}
        isSelected={false}
        onClick={mockOnClick}
        style={customStyle}
      />
    );

    const card = screen.getByRole("button");
    expect(card).toHaveStyle(customStyle);
  });

  test("handles missing optional fields gracefully", () => {
    const modelWithoutOptional = {
      ...mockModel,
      metrics: {
        parameterCount: "100M",
        contextLength: 2048,
        languages: 10,
      },
      publication: undefined,
    };

    render(
      <ModelCard
        model={modelWithoutOptional}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Test Model")).toBeInTheDocument();
    expect(screen.getByText("100M")).toBeInTheDocument();
    expect(screen.queryByText("85.5")).not.toBeInTheDocument();
  });

  test("formats date correctly", () => {
    const modelWithDifferentDate = {
      ...mockModel,
      releaseDate: "2024-12-31",
    };

    render(
      <ModelCard
        model={modelWithDifferentDate}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Dec 31, 2024")).toBeInTheDocument();
  });

  test("handles long descriptions with ellipsis", () => {
    const modelWithLongDescription = {
      ...mockModel,
      shortDescription:
        "This is a very long description that should be truncated after two lines to maintain the card layout and prevent overflow issues in the UI",
    };

    render(
      <ModelCard
        model={modelWithLongDescription}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const description = screen.getByText(/This is a very long description/);
    expect(description).toHaveStyle({
      display: "-webkit-box",
      WebkitLineClamp: "2",
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    });
  });

  test("maintains accessibility attributes", () => {
    render(
      <ModelCard model={mockModel} isSelected={false} onClick={mockOnClick} />
    );

    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("tabIndex", "0");
    expect(card).toHaveAttribute("aria-pressed", "false");
  });
});
