"use client";

import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";

const colors = {
  node: {
    person: "#3498db",
    organization: "#9b59b6",
    location: "#2ecc71",
    date: "#f1c40f",
    misc: "#e74c3c",
    default: "#1abc9c"
  },
  edge: "#3498db",
  text: "#ecf0f1",
  background: "#2c3e50"
};

const GraphVisualization = ({ graphData }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const nodes = [];
    const edges = [];
    
    if (graphData.entities) {
      Object.entries(graphData.entities).forEach(([type, entities]) => {
        entities.forEach(entity => {
          const nodeColor = colors.node[type.toLowerCase()] || colors.node.default;
          nodes.push({
            data: { 
              id: entity,
              label: entity,
              type: type,
              color: nodeColor
            }
          });
        });
      });
    }
    
    if (graphData.relationships) {
      graphData.relationships.forEach((rel, index) => {
        edges.push({
          data: {
            id: `edge-${index}`,
            source: rel[0],
            target: rel[2],
            label: rel[1]
          }
        });
      });
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            "label": "data(label)",
            "color": colors.text,
            "text-outline-color": "#000",
            "text-outline-width": 1,
            "font-size": "12px",
            "text-valign": "center",
            "text-halign": "center",
            "border-width": 2,
            "border-color": "#fff",
            "border-opacity": 0.2,
            "width": "40px",
            "height": "40px",
          }
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": colors.edge,
            "target-arrow-color": colors.edge,
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "label": "data(label)",
            "font-size": "10px",
            "color": colors.text,
            "text-outline-color": colors.background,
            "text-outline-width": 2,
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            "arrow-scale": 0.8,
          }
        }
      ],
      layout: {
        name: "cose",
        animate: true,
        nodeDimensionsIncludeLabels: true,
        refresh: 20,
        fit: true,
        padding: 30,
        nodeRepulsion: 4500,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 1.2,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    });

    cy.on("tap", "node", function(evt) {
      const node = evt.target;
      console.log("Tapped node:", node.id());
      
      cy.elements().style({
        "opacity": 0.3,
        "line-color": colors.edge,
        "target-arrow-color": colors.edge
      });
      
      node.style({
        "opacity": 1,
        "background-color": "data(color)",
        "border-width": 3,
        "border-color": "#fff",
        "border-opacity": 0.8,
      });
      
      node.connectedEdges().style({
        "opacity": 1,
        "line-color": "#fff",
        "target-arrow-color": "#fff",
        "width": 3
      });
      
      node.connectedEdges().connectedNodes().style({
        "opacity": 1,
        "background-color": "data(color)",
        "border-width": 3,
        "border-color": "#fff",
        "border-opacity": 0.8,
      });
    });
    
    cy.on("tap", function(evt) {
      if (evt.target === cy) {
        cy.elements().style({
          "opacity": 1,
          "line-color": colors.edge,
          "target-arrow-color": colors.edge,
          "width": 2,
          "border-width": 2,
          "border-color": "#fff",
          "border-opacity": 0.2,
        });
      }
    });

    return () => cy.destroy();
  }, [graphData]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden" ref={containerRef} />
  );
};

export default GraphVisualization;