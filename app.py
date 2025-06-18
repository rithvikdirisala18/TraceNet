import streamlit as st
import streamlit.components.v1 as components
from entity_extractor import extract_entities, extract_svo
from graph_builder import build_graph

st.set_page_config(page_title="Context Analyzer")
st.title("Contextual Agent Analyzer")

text_input = st.text_area("Paste article text or paragraph", height=300)

if st.button("Extract Entities"):
    if text_input.strip():
        with st.spinner("Analyzing..."):
            entities = extract_entities(text_input)
            st.success("Done!")
            for label, items in entities.items():
                st.markdown(f"### {label}s")
                for item in items:
                    st.markdown(f"- {item}")
    else:
        st.warning("Please enter some text")

if st.button("Extract Relationships"):
    if text_input.strip():
        with st.spinner("Extracting relationships..."):
            svos = extract_svo(text_input)
            st.write("Extracted relationships:")
            for s, v, o in svos:
                st.markdown(f"- **{s}** → _{v}_ → **{o}**")

            html_path = build_graph(svos)
            components.html(open(html_path, 'r', encoding='utf-8').read(), height=550)
    else:
        st.warning("Please enter some text")
