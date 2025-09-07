import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";

const GraphVisualization = ({ graphData }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...graphData.entities.map((entity) => ({
          data: { id: entity, label: entity },
        })),
        ...graphData.relationships.map(([source, label, target]) => ({
          data: { source, target, label },
        })),
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0074D9",
            label: "data(label)",
            color: "#fff",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#0074D9",
            "target-arrow-color": "#0074D9",
            "target-arrow-shape": "triangle",
            label: "data(label)",
          },
        },
      ],
      layout: { name: "grid" },
    });

    return () => cy.destroy();
  }, [graphData]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
};

export default GraphVisualization;