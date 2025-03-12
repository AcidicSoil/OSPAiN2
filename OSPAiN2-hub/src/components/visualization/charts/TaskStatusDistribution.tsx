import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Task, TaskStatus } from "../../../types/Task";

interface TaskStatusDistributionProps {
  tasks: Task[];
}

/**
 * Task Status Distribution Component
 *
 * A pie chart visualization of task status distribution using D3.js.
 * Shows the breakdown of tasks by their current status (pending, running, completed, etc.).
 */
const TaskStatusDistribution: React.FC<TaskStatusDistributionProps> = ({
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
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Prepare data - count tasks by status
    const statusMap = new Map<string, number>();

    // Initialize all statuses with zero count
    Object.values(TaskStatus).forEach((status) => {
      statusMap.set(status, 0);
    });

    // Count tasks by status
    tasks.forEach((task) => {
      const current = statusMap.get(task.status) || 0;
      statusMap.set(task.status, current + 1);
    });

    // Filter out statuses with zero count
    const statusData = Array.from(statusMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));

    // Define color scheme - using a custom color for each status
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(Object.values(TaskStatus))
      .range([
        "#3b82f6", // pending - blue
        "#60a5fa", // running - lighter blue
        "#22c55e", // completed - green
        "#ef4444", // failed - red
        "#6b7280", // cancelled - gray
        "#a855f7", // retry - purple
      ]);

    // Generate the pie chart
    const pie = d3
      .pie<any>()
      .value((d) => d.count)
      .sort(null); // Don't sort to preserve status order

    const data_ready = pie(statusData);

    // Define arc generator
    const arc = d3
      .arc()
      .innerRadius(0) // No inner radius (classic pie chart)
      .outerRadius(radius);

    // Add arcs
    svg
      .selectAll("path")
      .data(data_ready)
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => colorScale(d.data.status))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8)
      .transition()
      .duration(500)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) as string;
        };
      });

    // Add labels
    svg
      .selectAll("text")
      .data(data_ready)
      .enter()
      .append("text")
      .text((d) => `${d.data.status}: ${d.data.count}`)
      .attr("transform", (d) => {
        const centroid = arc.centroid(d as any);
        // Move the label slightly away from the center
        const x = centroid[0] * 1.5;
        const y = centroid[1] * 1.5;
        return `translate(${x}, ${y})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#e2e8f0")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .transition()
      .delay(500)
      .duration(500)
      .style("opacity", 1);

    // Add percentage annotation
    svg
      .selectAll("text.percentage")
      .data(data_ready)
      .enter()
      .append("text")
      .attr("class", "percentage")
      .text((d) => {
        const percent = Math.round((d.data.count / tasks.length) * 100);
        return percent > 5 ? `${percent}%` : "";
      })
      .attr("transform", (d) => {
        const centroid = arc.centroid(d as any);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
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
        {Object.values(TaskStatus).map((status) => (
          <div
            key={status}
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
                  status === TaskStatus.PENDING
                    ? "#3b82f6"
                    : status === TaskStatus.RUNNING
                    ? "#60a5fa"
                    : status === TaskStatus.COMPLETED
                    ? "#22c55e"
                    : status === TaskStatus.FAILED
                    ? "#ef4444"
                    : status === TaskStatus.CANCELLED
                    ? "#6b7280"
                    : "#a855f7", // retry
                marginRight: "4px",
              }}
            />
            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusDistribution;
