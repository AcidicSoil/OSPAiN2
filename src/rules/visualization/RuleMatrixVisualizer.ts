/**
 * Rule Matrix Visualization System
 * 
 * Provides visualization capabilities for the rule matrix, showing relationships
 * and connections between different rules in the ecosystem.
 */

import { RuleType, RuleFileInfo, RuleRelationship } from '../types';
import { KnowledgeGraph } from '../../knowledge/KnowledgeGraph';
import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeGraphIntegration, KnowledgeGraphEnhancement } from './KnowledgeGraphIntegration';

export interface VisualizationNode {
  id: string;
  label: string;
  type: RuleType;
  group: string;
  metrics: {
    dependencies: number;
    dependents: number;
    strength: number;
  };
  concepts?: string[];
  contentType?: string;
  thematicGroups?: string[];
  keyPhrases?: string[];
  sentimentScore?: number;
  relevanceScore?: number;
  entities?: Array<{
    text: string;
    type: string;
  }>;
}

export interface VisualizationLink {
  source: string;
  target: string;
  type: string;
  strength: number;
  semantic?: boolean;
}

export interface VisualizationData {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
}

export interface VisualizationOptions {
  includeTypes?: RuleType[];
  excludeTypes?: RuleType[];
  groupBy?: 'type' | 'directory' | 'purpose' | 'contentType' | 'thematic' | 'sentiment';
  minRelationshipStrength?: number;
  showOrphanedNodes?: boolean;
  highlightRules?: string[];
  showSemanticConnections?: boolean;
  minSemanticSimilarity?: number;
  includeSentimentAnalysis?: boolean;
  includeKeyPhrases?: boolean;
  includeEntities?: boolean;
  filterByTheme?: string[];
  filterByContentType?: string[];
}

export class RuleMatrixVisualizer {
  private knowledgeGraph: KnowledgeGraph;
  private knowledgeGraphIntegration: KnowledgeGraphIntegration;

  constructor(knowledgeGraph?: KnowledgeGraph) {
    this.knowledgeGraph = knowledgeGraph || new KnowledgeGraph();
    this.knowledgeGraphIntegration = new KnowledgeGraphIntegration(this.knowledgeGraph);
  }

  /**
   * Generate visualization data for rule relationships
   */
  public async generateVisualizationData(
    rules: RuleFileInfo[],
    relationships: RuleRelationship[],
    options: VisualizationOptions = {}
  ): Promise<VisualizationData> {
    // Apply filters based on options
    const filteredRules = this.filterRules(rules, options);
    const filteredRelationships = this.filterRelationships(relationships, filteredRules, options);
    
    // Create nodes
    const nodes = filteredRules.map(rule => this.createNode(rule, relationships));
    
    // Create links
    const links = filteredRelationships.map(rel => this.createLink(rel));
    
    // Apply knowledge graph enhancements if available
    if (this.knowledgeGraph) {
      await this.enhanceWithKnowledgeGraph(nodes, links, rules, options);
    }
    
    return { nodes, links };
  }

  /**
   * Generate an HTML visualization file
   */
  public async generateHtmlVisualization(
    rules: RuleFileInfo[],
    relationships: RuleRelationship[],
    outputPath: string,
    options: VisualizationOptions = {}
  ): Promise<string> {
    const data = await this.generateVisualizationData(rules, relationships, options);
    const html = this.createHtmlTemplate(data, options);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write HTML file
    fs.writeFileSync(outputPath, html);
    return outputPath;
  }

  /**
   * Generate a JSON data file for external visualization tools
   */
  public async generateJsonData(
    rules: RuleFileInfo[],
    relationships: RuleRelationship[],
    outputPath: string,
    options: VisualizationOptions = {}
  ): Promise<string> {
    const data = await this.generateVisualizationData(rules, relationships, options);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write JSON file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    return outputPath;
  }

  /**
   * Filter rules based on visualization options
   */
  private filterRules(
    rules: RuleFileInfo[],
    options: VisualizationOptions
  ): RuleFileInfo[] {
    let filtered = [...rules];
    
    // Filter by include types
    if (options.includeTypes && options.includeTypes.length > 0) {
      filtered = filtered.filter(rule => 
        options.includeTypes!.includes(rule.currentType)
      );
    }
    
    // Filter by exclude types
    if (options.excludeTypes && options.excludeTypes.length > 0) {
      filtered = filtered.filter(rule => 
        !options.excludeTypes!.includes(rule.currentType)
      );
    }
    
    return filtered;
  }

  /**
   * Filter relationships based on visualization options
   */
  private filterRelationships(
    relationships: RuleRelationship[],
    rules: RuleFileInfo[],
    options: VisualizationOptions
  ): RuleRelationship[] {
    const rulePaths = rules.map(r => r.path);
    let filtered = relationships.filter(rel => 
      rulePaths.includes(rel.sourceRule) && rulePaths.includes(rel.targetRule)
    );
    
    // Filter by minimum relationship strength
    if (options.minRelationshipStrength !== undefined) {
      filtered = filtered.filter(rel => 
        rel.strength >= options.minRelationshipStrength!
      );
    }
    
    return filtered;
  }

  /**
   * Create a visualization node from a rule
   */
  private createNode(
    rule: RuleFileInfo,
    relationships: RuleRelationship[]
  ): VisualizationNode {
    // Calculate metrics
    const dependencies = relationships.filter(rel => rel.sourceRule === rule.path).length;
    const dependents = relationships.filter(rel => rel.targetRule === rule.path).length;
    
    // Calculate average relationship strength
    const relStrengths = relationships
      .filter(rel => rel.sourceRule === rule.path || rel.targetRule === rule.path)
      .map(rel => rel.strength);
      
    const strength = relStrengths.length > 0 
      ? relStrengths.reduce((sum, val) => sum + val, 0) / relStrengths.length
      : 0;
    
    return {
      id: rule.path,
      label: path.basename(rule.path),
      type: rule.currentType,
      group: this.getNodeGroup(rule),
      metrics: {
        dependencies,
        dependents,
        strength
      }
    };
  }

  /**
   * Create a visualization link from a relationship
   */
  private createLink(relationship: RuleRelationship): VisualizationLink {
    return {
      source: relationship.sourceRule,
      target: relationship.targetRule,
      type: relationship.relationshipType,
      strength: relationship.strength,
      semantic: false
    };
  }

  /**
   * Get the group for a node based on rule properties
   */
  private getNodeGroup(rule: RuleFileInfo): string {
    // Default to rule type
    return rule.currentType;
  }

  /**
   * Enhance visualization data with knowledge graph information
   */
  private async enhanceWithKnowledgeGraph(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    rules: RuleFileInfo[],
    options: VisualizationOptions
  ): Promise<void> {
    // Connect to knowledge graph and enhance visualization with semantic connections
    await this.knowledgeGraphIntegration.enhanceVisualization(nodes, links, rules, []);
    
    // Apply advanced options for NLP-enhanced visualization
    if (options.filterByTheme && options.filterByTheme.length > 0) {
      this.filterNodesByTheme(nodes, options.filterByTheme);
    }
    
    if (options.filterByContentType && options.filterByContentType.length > 0) {
      this.filterNodesByContentType(nodes, options.filterByContentType);
    }
    
    if (options.minSemanticSimilarity) {
      this.filterLinksBySemanticSimilarity(links, options.minSemanticSimilarity);
    }
    
    // Apply grouping based on semantic information if specified
    if (options.groupBy === 'contentType' || options.groupBy === 'thematic' || options.groupBy === 'sentiment') {
      this.applySemanticGrouping(nodes, options.groupBy);
    }
  }
  
  /**
   * Filter nodes by theme
   * @param nodes Visualization nodes
   * @param themes Themes to include
   */
  private filterNodesByTheme(nodes: VisualizationNode[], themes: string[]): void {
    const nodeIndices: number[] = [];
    
    // Identify nodes to remove
    nodes.forEach((node, index) => {
      if (!node.thematicGroups || !node.thematicGroups.some(theme => themes.includes(theme))) {
        nodeIndices.push(index);
      }
    });
    
    // Remove nodes in reverse order to maintain correct indices
    for (let i = nodeIndices.length - 1; i >= 0; i--) {
      nodes.splice(nodeIndices[i], 1);
    }
  }
  
  /**
   * Filter nodes by content type
   * @param nodes Visualization nodes
   * @param contentTypes Content types to include
   */
  private filterNodesByContentType(nodes: VisualizationNode[], contentTypes: string[]): void {
    const nodeIndices: number[] = [];
    
    // Identify nodes to remove
    nodes.forEach((node, index) => {
      if (!node.contentType || !contentTypes.includes(node.contentType)) {
        nodeIndices.push(index);
      }
    });
    
    // Remove nodes in reverse order to maintain correct indices
    for (let i = nodeIndices.length - 1; i >= 0; i--) {
      nodes.splice(nodeIndices[i], 1);
    }
  }
  
  /**
   * Filter links by semantic similarity
   * @param links Visualization links
   * @param minSimilarity Minimum similarity threshold
   */
  private filterLinksBySemanticSimilarity(links: VisualizationLink[], minSimilarity: number): void {
    const linkIndices: number[] = [];
    
    // Identify links to remove
    links.forEach((link, index) => {
      if (link.semantic && link.strength < minSimilarity) {
        linkIndices.push(index);
      }
    });
    
    // Remove links in reverse order to maintain correct indices
    for (let i = linkIndices.length - 1; i >= 0; i--) {
      links.splice(linkIndices[i], 1);
    }
  }
  
  /**
   * Apply semantic grouping to nodes
   * @param nodes Visualization nodes
   * @param groupType Type of grouping to apply
   */
  private applySemanticGrouping(
    nodes: VisualizationNode[],
    groupType: 'contentType' | 'thematic' | 'sentiment'
  ): void {
    nodes.forEach(node => {
      if (groupType === 'contentType' && node.contentType) {
        node.group = node.contentType;
      } else if (groupType === 'thematic' && node.thematicGroups && node.thematicGroups.length > 0) {
        node.group = node.thematicGroups[0];
      } else if (groupType === 'sentiment' && node.sentimentScore !== undefined) {
        // Group by sentiment: positive, neutral, negative
        if (node.sentimentScore > 0.1) {
          node.group = 'positive';
        } else if (node.sentimentScore < -0.1) {
          node.group = 'negative';
        } else {
          node.group = 'neutral';
        }
      }
    });
  }
  
  /**
   * Generate visualization data with semantic analysis
   * @param rules List of rules
   * @param relationships Relationships between rules
   * @param options Visualization options
   * @returns Visualization data with semantic enhancements
   */
  public async generateVisualizationDataWithSemanticAnalysis(
    rules: RuleFileInfo[],
    relationships: RuleRelationship[],
    options: VisualizationOptions = {}
  ): Promise<VisualizationData> {
    // Initialize with basic visualization data
    const data = await this.generateVisualizationData(rules, relationships, options);
    
    // Perform advanced NLP analysis
    await this.knowledgeGraphIntegration.createKnowledgeGraphNodes(rules);
    
    // Apply additional semantic options
    await this.enhanceWithKnowledgeGraph(data.nodes, data.links, rules, options);
    
    return data;
  }
  
  /**
   * Generate HTML visualization with semantic analysis interface
   * @param rules List of rules
   * @param relationships Relationships between rules
   * @param outputPath Output path for HTML file
   * @param options Visualization options
   * @returns Path to generated HTML file
   */
  public async generateSemanticHtmlVisualization(
    rules: RuleFileInfo[],
    relationships: RuleRelationship[],
    outputPath: string,
    options: VisualizationOptions = {}
  ): Promise<string> {
    // Generate visualization data with semantic analysis
    const data = await this.generateVisualizationDataWithSemanticAnalysis(
      rules,
      relationships,
      options
    );
    
    // Create enhanced HTML template with semantic analysis controls
    const html = this.createSemanticHtmlTemplate(data, options);
    
    // Write to file
    fs.writeFileSync(outputPath, html);
    
    return outputPath;
  }
  
  /**
   * Create HTML template with semantic analysis interface
   * @param data Visualization data
   * @param options Visualization options
   * @returns HTML content
   */
  private createSemanticHtmlTemplate(
    data: VisualizationData,
    options: VisualizationOptions
  ): string {
    // Extract unique themes and content types for filters
    const themes = new Set<string>();
    const contentTypes = new Set<string>();
    
    data.nodes.forEach(node => {
      if (node.thematicGroups) {
        node.thematicGroups.forEach(theme => themes.add(theme));
      }
      if (node.contentType) {
        contentTypes.add(node.contentType);
      }
    });
    
    // Add semantic filtering controls to HTML
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rule Matrix Visualization</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          display: flex;
          flex-direction: column;
            height: 100vh;
        }
        #controls {
          padding: 10px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }
        #graph {
          flex: 1;
          overflow: hidden;
        }
        .control-group {
          margin-bottom: 10px;
        }
        .node {
          fill: #69b3a2;
            stroke: #fff;
          stroke-width: 2px;
        }
        .link {
            stroke: #999;
            stroke-opacity: 0.6;
        }
        .semantic-link {
          stroke: #ff7f0e;
            stroke-dasharray: 5;
          stroke-opacity: 0.6;
        }
        .tooltip {
            position: absolute;
          background: #fff;
            border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          pointer-events: none;
          font-size: 12px;
            max-width: 300px;
        }
        select, button {
          padding: 5px;
          margin-right: 5px;
        }
        .legend {
            position: absolute;
            top: 10px;
            right: 10px;
          background: rgba(255,255,255,0.8);
            border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
            font-size: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
            margin-bottom: 5px;
        }
        .legend-color {
            width: 15px;
            height: 15px;
            margin-right: 5px;
        }
    </style>
</head>
<body>
      <div id="controls">
        <div class="control-group">
          <label for="groupBy">Group By:</label>
          <select id="groupBy">
                <option value="type">Rule Type</option>
                <option value="directory">Directory</option>
                <option value="contentType">Content Type</option>
                <option value="thematic">Thematic Group</option>
            <option value="sentiment">Sentiment</option>
            </select>
          
          <label for="minSimilarity">Min Semantic Similarity:</label>
          <input type="range" id="minSimilarity" min="0" max="1" step="0.1" value="${options.minSemanticSimilarity || 0.3}">
          <span id="similarityValue">${options.minSemanticSimilarity || 0.3}</span>
          
          <label for="showSemanticConnections">
            <input type="checkbox" id="showSemanticConnections" ${options.showSemanticConnections ? 'checked' : ''}>
            Show Semantic Connections
          </label>
    </div>
    
        <div class="control-group">
          <label for="contentTypeFilter">Content Type:</label>
          <select id="contentTypeFilter" multiple>
            ${Array.from(contentTypes).map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
          
          <label for="themeFilter">Theme:</label>
          <select id="themeFilter" multiple>
            ${Array.from(themes).map(theme => `<option value="${theme}">${theme}</option>`).join('')}
          </select>
          
          <button id="applyFilters">Apply Filters</button>
          <button id="resetFilters">Reset Filters</button>
        </div>
    </div>
      
      <div id="graph"></div>
    
    <script>
        // Graph data
    const data = ${JSON.stringify(data)};
        let filteredData = JSON.parse(JSON.stringify(data));
        
        // Visualization settings
        const width = window.innerWidth;
        const height = window.innerHeight - document.getElementById('controls').offsetHeight;
        
        // Create SVG
        const svg = d3.select("#graph")
          .append("svg")
          .attr("width", width)
          .attr("height", height);
          
        // Create tooltip
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
            
        // Create force simulation
        const simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(d => d.id).distance(100))
          .force("charge", d3.forceManyBody().strength(-200))
          .force("center", d3.forceCenter(width / 2, height / 2));
          
        // Create color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        
        // Initialize graph
        let links = svg.append("g")
          .selectAll("line");
          
        let nodes = svg.append("g")
          .selectAll("circle");
          
        let labels = svg.append("g")
          .selectAll("text");
          
        let legend = d3.select("#graph")
          .append("div")
          .attr("class", "legend");
          
        // Update graph function
        function updateGraph() {
          // Remove existing elements
          links.remove();
          nodes.remove();
          labels.remove();
          legend.html("");
          
          // Add links
          links = svg.select("g:nth-child(1)")
            .selectAll("line")
            .data(filteredData.links)
            .enter()
            .append("line")
            .attr("class", d => d.semantic ? "semantic-link" : "link")
            .attr("stroke-width", d => Math.max(1, d.strength * 5));
            
          // Add nodes
          nodes = svg.select("g:nth-child(2)")
            .selectAll("circle")
            .data(filteredData.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", d => 5 + d.metrics.dependencies + d.metrics.dependents)
            .attr("fill", d => color(d.group))
            .call(d3.drag()
              .on("start", dragStarted)
              .on("drag", dragging)
              .on("end", dragEnded))
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);
                
        // Add labels
          labels = svg.select("g:nth-child(3)")
            .selectAll("text")
            .data(filteredData.nodes)
            .enter()
            .append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(d => d.label)
            .style("font-size", "10px")
            .style("pointer-events", "none");
            
          // Update simulation
          simulation.nodes(filteredData.nodes)
            .on("tick", ticked);
            
          simulation.force("link")
            .links(filteredData.links);
            
          // Reset simulation
          simulation.alpha(1).restart();
          
          // Add legend
          const groups = new Map();
          filteredData.nodes.forEach(node => {
            if (!groups.has(node.group)) {
              groups.set(node.group, color(node.group));
            }
          });
          
          const legendItems = Array.from(groups.entries()).map(([group, color]) => {
            return { group, color };
          });
          
          legendItems.forEach(item => {
            const legendItem = legend.append("div")
              .attr("class", "legend-item");
              
            legendItem.append("div")
              .attr("class", "legend-color")
              .style("background-color", item.color);
              
            legendItem.append("div")
              .text(item.group);
          });
        }
        
        // Initialize graph
        updateGraph();
        
        // Event handlers
        function dragStarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragging(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragEnded(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        function showTooltip(event, d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            
          let content = \`
            <div><strong>\${d.label}</strong> (\${d.id})</div>
            <div>Type: \${d.type}</div>
            <div>Group: \${d.group}</div>
            <div>Dependencies: \${d.metrics.dependencies}</div>
            <div>Dependents: \${d.metrics.dependents}</div>
          \`;
          
          if (d.contentType) {
            content += \`<div>Content Type: \${d.contentType}</div>\`;
          }
          
            if (d.concepts && d.concepts.length > 0) {
            content += \`<div>Concepts: \${d.concepts.join(", ")}</div>\`;
          }
          
            if (d.thematicGroups && d.thematicGroups.length > 0) {
            content += \`<div>Themes: \${d.thematicGroups.join(", ")}</div>\`;
          }
          
          if (d.keyPhrases && d.keyPhrases.length > 0) {
            content += \`<div>Key Phrases: \${d.keyPhrases.slice(0, 3).join(", ")}</div>\`;
          }
          
          if (d.sentimentScore !== undefined) {
            content += \`<div>Sentiment: \${d.sentimentScore > 0.1 ? "Positive" : d.sentimentScore < -0.1 ? "Negative" : "Neutral"}</div>\`;
          }
          
          tooltip.html(content)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
        
        function hideTooltip() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        }
        
        function ticked() {
          links
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
            
          nodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
            
          labels
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        }
        
        // Control handlers
        document.getElementById("groupBy").addEventListener("change", function() {
          const groupBy = this.value;
          filteredData.nodes.forEach(node => {
            if (groupBy === "type") {
              node.group = node.type;
            } else if (groupBy === "directory") {
              const parts = node.id.split("/");
              node.group = parts.length > 1 ? parts[0] : "root";
            } else if (groupBy === "contentType" && node.contentType) {
              node.group = node.contentType;
            } else if (groupBy === "thematic" && node.thematicGroups && node.thematicGroups.length > 0) {
              node.group = node.thematicGroups[0];
            } else if (groupBy === "sentiment" && node.sentimentScore !== undefined) {
              if (node.sentimentScore > 0.1) {
                node.group = "positive";
              } else if (node.sentimentScore < -0.1) {
                node.group = "negative";
              } else {
                node.group = "neutral";
              }
            }
          });
          
          updateGraph();
        });
        
        document.getElementById("minSimilarity").addEventListener("input", function() {
          document.getElementById("similarityValue").textContent = this.value;
        });
        
        document.getElementById("applyFilters").addEventListener("click", function() {
          // Reset to original data
          filteredData = JSON.parse(JSON.stringify(data));
          
          // Apply filters
          const showSemanticConnections = document.getElementById("showSemanticConnections").checked;
          const minSimilarity = parseFloat(document.getElementById("minSimilarity").value);
          
          // Filter links
          if (!showSemanticConnections) {
            filteredData.links = filteredData.links.filter(link => !link.semantic);
          } else {
            filteredData.links = filteredData.links.filter(link => !link.semantic || link.strength >= minSimilarity);
          }
          
          // Apply content type filter
          const contentTypeSelect = document.getElementById("contentTypeFilter");
          const selectedContentTypes = Array.from(contentTypeSelect.selectedOptions).map(option => option.value);
          
          if (selectedContentTypes.length > 0) {
            filteredData.nodes = filteredData.nodes.filter(node => 
              node.contentType && selectedContentTypes.includes(node.contentType)
            );
          }
          
          // Apply theme filter
          const themeSelect = document.getElementById("themeFilter");
          const selectedThemes = Array.from(themeSelect.selectedOptions).map(option => option.value);
          
          if (selectedThemes.length > 0) {
            filteredData.nodes = filteredData.nodes.filter(node => 
              node.thematicGroups && node.thematicGroups.some(theme => selectedThemes.includes(theme))
            );
          }
          
          // Filter links to only include filtered nodes
          const nodeIds = new Set(filteredData.nodes.map(node => node.id));
          filteredData.links = filteredData.links.filter(link => 
            nodeIds.has(link.source.id || link.source) && nodeIds.has(link.target.id || link.target)
          );
          
          updateGraph();
        });
        
        document.getElementById("resetFilters").addEventListener("click", function() {
          // Reset to original data
          filteredData = JSON.parse(JSON.stringify(data));
          
          // Reset controls
          document.getElementById("groupBy").value = "type";
          document.getElementById("minSimilarity").value = "0.3";
          document.getElementById("similarityValue").textContent = "0.3";
          document.getElementById("showSemanticConnections").checked = true;
          
          const contentTypeSelect = document.getElementById("contentTypeFilter");
          for (let i = 0; i < contentTypeSelect.options.length; i++) {
            contentTypeSelect.options[i].selected = false;
          }
          
          const themeSelect = document.getElementById("themeFilter");
          for (let i = 0; i < themeSelect.options.length; i++) {
            themeSelect.options[i].selected = false;
          }
          
          updateGraph();
        });
        
        // Initial grouping
        const initialGroupBy = "${options.groupBy || 'type'}";
        document.getElementById("groupBy").value = initialGroupBy;
        
        // Responsive resize
        window.addEventListener("resize", function() {
          const width = window.innerWidth;
          const height = window.innerHeight - document.getElementById('controls').offsetHeight;
          
          svg.attr("width", width)
            .attr("height", height);
            
          simulation.force("center", d3.forceCenter(width / 2, height / 2));
          simulation.alpha(1).restart();
        });
    </script>
</body>
</html>
    `;
  }
} 