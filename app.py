import streamlit as st
import streamlit.components.v1 as components
from backend.analysis.analysis.entity_extractor import analyze_text, query_knowledge_graph
from pyvis.network import Network
import tempfile

st.set_page_config(page_title="Context Analyzer")
st.title("Contextual Agent Analyzer")

# Text input for the user
text_input = st.text_area("Paste article text or paragraph", height=300)

# Button to analyze the text
if st.button("Analyze Text"):
    if text_input.strip():
        with st.spinner("Analyzing..."):
            # Analyze the text and store results in session state
            entities, svos, knowledge_graph = analyze_text(text_input)
            st.session_state["entities"] = entities
            st.session_state["svos"] = svos
            st.session_state["knowledge_graph"] = knowledge_graph
            st.session_state["analyzed"] = True
            st.success("Analysis complete!")
    else:
        st.warning("Please enter some text")

# Check if analysis has been completed
if st.session_state.get("analyzed", False):
    # Display extracted entities
    st.subheader("Extracted Entities")
    for label, items in st.session_state["entities"].items():
        st.markdown(f"### {label}s")
        for item in items:
            st.markdown(f"- {item}")

    # Display extracted relationships (SVOs)
    st.subheader("Extracted Relationships")
    for subj, verb, obj in st.session_state["svos"]:
        st.markdown(f"- **{subj}** → _{verb}_ → **{obj}**")

    # Visualize the knowledge graph
    st.subheader("Knowledge Graph")
    net = Network(height="500px", width="100%", bgcolor="#222222", font_color="white")

    # Add nodes and edges to the graph
    for node, data in st.session_state["knowledge_graph"].nodes(data=True):
        net.add_node(node, label=node, title=f"Type: {data['type']}", color="blue" if data['type'] == "PERSON" else "green")
    for source, target, data in st.session_state["knowledge_graph"].edges(data=True):
        net.add_edge(source, target, title=data['relationship'])

    # Save the graph to a temporary HTML file and display it
    with tempfile.NamedTemporaryFile(delete=False, suffix=".html") as tmp_file:
        net.save_graph(tmp_file.name)
        components.html(open(tmp_file.name, "r").read(), height=500, scrolling=True)

    # Query the knowledge graph
    st.subheader("Query the Knowledge Graph")
    query = st.text_input("Enter your query (e.g., 'Who is Barack Obama married to?')")
    if st.button("Submit Query"):
        answers = query_knowledge_graph(st.session_state["knowledge_graph"], query)
        st.write("Answers:")
        for answer in answers:
            st.markdown(f"- {answer}")