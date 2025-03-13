import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelDetailPanel from "./model-detail-panel";

const mockModel = {
  id: "test-model",
  name: "Test Model",
  version: "v1.0.0",
  releaseDate: "2024-01-01",
  description:
    "A comprehensive test model for testing purposes with detailed specifications and capabilities.",
  shortDescription: "Test model",
  type: "embeddings",
  metrics: {
    parameterCount: "100M",
    contextLength: 2048,
    languages: 10,
    performanceScore: 85.5,
  },
  useCases: ["Text search", "Information retrieval", "Semantic similarity"],
  publication: {
    title: "Test Paper: Advanced Neural Search",
    url: "https://example.com/paper",
    publisher: "Test Publisher",
    date: "2024-01-01",
  },
  documentationUrl: "https://example.com/docs",
};

describe("ModelDetailPanel", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test("renders null when no model is provided", () => {
    const { container } = render(
      <ModelDetailPanel model={null} onClose={mockOnClose} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders model information correctly", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    expect(screen.getByText("Test Model")).toBeInTheDocument();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
    expect(screen.getByText(/Released: Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(mockModel.description)).toBeInTheDocument();
  });

  test("displays technical specifications correctly", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    expect(screen.getByText("Technical Specifications")).toBeInTheDocument();
    expect(screen.getByText("100M")).toBeInTheDocument();
    expect(screen.getByText("2048 tokens")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("85.5")).toBeInTheDocument();
  });

  test("displays use cases correctly", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    expect(screen.getByText("Use Cases")).toBeInTheDocument();
    mockModel.useCases.forEach((useCase) => {
      expect(screen.getByText(useCase)).toBeInTheDocument();
    });
  });

  test("displays publication information when available", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    expect(screen.getByText("Research")).toBeInTheDocument();
    expect(screen.getByText(mockModel.publication.title)).toBeInTheDocument();
    expect(
      screen.getByText(mockModel.publication.publisher)
    ).toBeInTheDocument();
    expect(screen.getByText(mockModel.publication.date)).toBeInTheDocument();
    expect(screen.getByText("Read Paper")).toHaveAttribute(
      "href",
      mockModel.publication.url
    );
  });

  test("handles missing publication information gracefully", () => {
    const modelWithoutPublication = {
      ...mockModel,
      publication: undefined,
    };

    render(
      <ModelDetailPanel model={modelWithoutPublication} onClose={mockOnClose} />
    );

    expect(screen.queryByText("Research")).not.toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", async () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when backdrop is clicked", async () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId("backdrop");
    await userEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("handles keyboard navigation", async () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });

    // Focus the close button
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    // Press Enter
    fireEvent.keyDown(closeButton, { key: "Enter" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  test("displays documentation link correctly", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    const docsLink = screen.getByText("View Documentation");
    expect(docsLink).toHaveAttribute("href", mockModel.documentationUrl);
    expect(docsLink).toHaveAttribute("target", "_blank");
    expect(docsLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("handles long descriptions with proper formatting", () => {
    const modelWithLongDescription = {
      ...mockModel,
      description:
        "This is a very long description that should be properly formatted and displayed in the detail panel. It should maintain readability and proper spacing while providing comprehensive information about the model's capabilities and use cases.",
    };

    render(
      <ModelDetailPanel
        model={modelWithLongDescription}
        onClose={mockOnClose}
      />
    );

    const description = screen.getByText(/This is a very long description/);
    expect(description).toHaveStyle({
      fontSize: "16px",
      lineHeight: "1.6",
    });
  });

  test("maintains accessibility attributes", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toHaveAttribute("aria-label", "Close panel");

    const panel = screen.getByRole("dialog");
    expect(panel).toHaveAttribute("aria-labelledby", "panel-title");
    expect(panel).toHaveAttribute("aria-describedby", "panel-description");
  });

  test("prevents body scrolling when panel is open", () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    expect(document.body).toHaveClass("detail-panel-open");
  });

  test("restores body scrolling when panel is closed", async () => {
    render(<ModelDetailPanel model={mockModel} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);

    expect(document.body).not.toHaveClass("detail-panel-open");
  });
});
