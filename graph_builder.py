import tempfile
import json

def build_graph(triples, entities, filename="graph.html"):
    """Build an interactive graph using vis.js, enhanced with named entity types."""

    # Flatten entity types into a lookup map
    entity_type_map = {}
    for ent_type, ent_list in entities.items():
        for ent in ent_list:
            entity_type_map[ent.lower()] = ent_type

    # Map entity types to consistent node colors
    def node_color(ent_type):
        return {
            "PERSON": "#8ecae6",  # Blue
            "ORG": "#ffb703",     # Orange
            "GPE": "#219ebc"      # Teal
        }.get(ent_type, "#adb5bd")  # Gray fallback

    def get_entity_type(phrase):
        for word in phrase.lower().split():
            if word in entity_type_map:
                return entity_type_map[word]
        return None

    # Build nodes and edges
    nodes = {}
    edges = []

    for subj, verb, obj in triples:
        for phrase in [subj, obj]:
            if phrase not in nodes:
                ent_type = get_entity_type(phrase)
                color = node_color(ent_type)
                nodes[phrase] = {
                    "id": phrase,
                    "label": phrase,
                    "color": color
                }

        edges.append({
            "from": subj,
            "to": obj,
            "label": verb,
            "arrows": "to"
        })

    # Finalize node list
    nodes_list = list(nodes.values())

    # Generate HTML using vis.js
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

    # Write to a temporary file
    tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".html").name
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    return tmp_path
