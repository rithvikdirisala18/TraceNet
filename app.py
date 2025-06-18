import streamlit as st
from entity_extractor import extract_entities

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
