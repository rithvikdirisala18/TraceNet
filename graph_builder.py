import tempfile
import json

def build_graph(triples, filename="graph.html"):
    """Build an interactive graph using vis.js directly"""
    
    # Prepare nodes and edges
    nodes = {}
    edges = []
    
    for i, (subj, verb, obj) in enumerate(triples):
        # Add subject node
        if subj not in nodes:
            nodes[subj] = {"id": subj, "label": subj, "color": "#97C2FC"}
        
        # Add object node
        if obj not in nodes:
            nodes[obj] = {"id": obj, "label": obj, "color": "#FFAB91"}
        
        # Add edge
        edges.append({
            "from": subj,
            "to": obj,
            "label": verb,
            "arrows": "to"
        })
    
    # Convert nodes dict to list
    nodes_list = list(nodes.values())
    
    # Generate HTML with vis.js
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Relationship Graph</title>
        <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
        <style type="text/css">
            #mynetworkid {{
                width: 100%;
                height: 500px;
                border: 1px solid lightgray;
            }}
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
            }}
        </style>
    </head>
    <body>
        <h2>Relationship Graph</h2>
        <div id="mynetworkid"></div>

        <script type="text/javascript">
            var nodes = new vis.DataSet({json.dumps(nodes_list)});
            var edges = new vis.DataSet({json.dumps(edges)});
            var container = document.getElementById('mynetworkid');
            var data = {{
                nodes: nodes,
                edges: edges
            }};
            var options = {{
                physics: {{
                    enabled: true,
                    stabilization: {{iterations: 100}}
                }},
                edges: {{
                    arrows: {{
                        to: {{enabled: true, scaleFactor: 1}}
                    }},
                    font: {{size: 12}},
                    smooth: {{type: 'continuous'}}
                }},
                nodes: {{
                    font: {{size: 14}},
                    shape: 'circle',
                    size: 20
                }},
                layout: {{
                    improvedLayout: true
                }}
            }};
            var network = new vis.Network(container, data, options);
        </script>
    </body>
    </html>
    """
    
    # Write to temporary file
    tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".html").name
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return tmp_path