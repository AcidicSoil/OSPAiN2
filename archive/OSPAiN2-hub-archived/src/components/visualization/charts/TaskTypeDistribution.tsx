import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Task, TaskType } from "../../../types/Task";

interface TaskTypeDistributionProps {
  tasks: Task[];
}

/**
 * Task Type Distribution Component
 *
 * A bar chart visualization showing the distribution of tasks by their type
 * (model request, embeddings, file operations, etc.).
 */
const TaskTypeDistribution: React.FC<TaskTypeDistributionProps> = ({
  tasks,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!tasks.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = 300;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 90, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data - count tasks by type
    const typeMap = new Map<string, number>();

    // Initialize all types with zero count
    Object.values(TaskType).forEach((type) => {
      typeMap.set(type, 0);
    });

    // Count tasks by type
    tasks.forEach((task) => {
      const current = typeMap.get(task.type) || 0;
      typeMap.set(task.type, current + 1);
    });

    // Convert to array for D3
    const typeData = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count); // Sort by count (descending)

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define scales
    const xScale = d3
      .scaleBand()
      .domain(typeData.map((d) => d.type))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(typeData, (d) => d.count) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(Object.values(TaskType))
      .range([
        "#3b82f6", // model_request - blue
        "#22c55e", // embeddings - green
        "#eab308", // file_operation - yellow
        "#ec4899", // data_processing - pink
        "#a855f7", // external_api - purple
        "#6b7280", // custom - gray
      ]);

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .style("font-size", "10px")
      .style("fill", "#cbd5e1");

    // Add y-axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#cbd5e1");

    // Add y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#cbd5e1")
      .text("Number of Tasks");

    // Add bars
    svg
      .selectAll(".bar")
      .data(typeData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.type) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.type))
      .attr("rx", 4) // Rounded corners
      .attr("opacity", 0.8)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr("y", (d) => yScale(d.count))
      .attr("height", (d) => innerHeight - yScale(d.count));

    // Add labels on top of bars
    svg
      .selectAll(".bar-label")
      .data(typeData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => (xScale(d.type) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.count) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#f8fafc")
      .style("opacity", 0)
      .text((d) => d.count)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100 + 400)
      .style("opacity", 1);
  }, [tasks]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <svg ref={svgRef}></svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        {Object.values(TaskType).map((type) => (
          <div
            key={type}
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "12px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                backgroundColor:
                  type === TaskType.MODEL_REQUEST
                    ? "#3b82f6"
                    : type === TaskType.EMBEDDINGS
                    ? "#22c55e"
                    : type === TaskType.FILE_OPERATION
                    ? "#eab308"
                    : type === TaskType.DATA_PROCESSING
                    ? "#ec4899"
                    : type === TaskType.EXTERNAL_API
                    ? "#a855f7"
                    : "#6b7280", // custom
                marginRight: "4px",
              }}
            />
            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTypeDistribution;
