"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const d3 = __importStar(require("d3"));
const material_1 = require("@mui/material");
const TaskDueDateDistribution = ({ data, width = 600, height = 300, binCount = 10, }) => {
    const svgRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!svgRef.current || !data.length)
            return;
        // Clear previous chart
        d3.select(svgRef.current).selectAll("*").remove();
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);
        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        // Process data for histogram
        const dates = data.map((d) => d.dueDate.getTime());
        const minDate = d3.min(dates) || 0;
        const maxDate = d3.max(dates) || 0;
        // Create histogram generator
        const histogram = d3
            .histogram()
            .domain([minDate, maxDate])
            .thresholds(binCount);
        // Generate bins
        const bins = histogram(dates);
        // Create scales
        const x = d3
            .scaleTime()
            .domain([new Date(minDate), new Date(maxDate)])
            .range([0, innerWidth]);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(bins, (d) => d.length) || 0])
            .range([innerHeight, 0]);
        // Add bars
        g.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", (d) => x(new Date(d.x0 || 0)))
            .attr("width", (d) => {
            const width = x(new Date(d.x1 || 0)) - x(new Date(d.x0 || 0)) - 1;
            return width > 0 ? width : 0;
        })
            .attr("y", (d) => y(d.length))
            .attr("height", (d) => innerHeight - y(d.length))
            .attr("fill", "#8ac4d0");
        // Add axes
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end");
        g.append("g").call(d3.axisLeft(y).ticks(5));
        // Add labels
        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom)
            .attr("text-anchor", "middle")
            .text("Due Date");
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .text("Number of Tasks");
    }, [data, width, height, binCount]);
    if (!data.length) {
        return (<material_1.Box sx={{
                width,
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
        <material_1.Typography variant="body2" color="textSecondary">
          No due date data available
        </material_1.Typography>
      </material_1.Box>);
    }
    return <svg ref={svgRef}/>;
};
exports.default = TaskDueDateDistribution;
//# sourceMappingURL=TaskDueDateDistribution.js.map