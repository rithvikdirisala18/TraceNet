import spacy
import re
import logging
from collections import defaultdict
import networkx as nx

nlp = spacy.load("en_core_web_sm")

logging.basicConfig(level=logging.INFO)

def convert(text):
    """Convert text into a spaCy Doc object."""
    return nlp(text)

def extract_entities(text):
    """Extract named entities from the text."""
    doc = nlp(text)
    entities = {"PERSON": set(), "ORG": set(), "GPE": set(), "DATE": set()}
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].add(ent.text)
    return {k: list(v) for k, v in entities.items()}

def classify_date(token):
    """Classify DATE entities into finer categories."""
    year_pattern = r"^\d{4}$"
    month_day_pattern = r"^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}$"
    relative_date_pattern = r"(next|last|this) (week|month|year)"

    if re.match(year_pattern, token.text):
        return "Year"
    elif re.match(month_day_pattern, token.text):
        return "Month and Day"
    elif re.match(relative_date_pattern, token.text.lower()):
        return "Relative Date"
    else:
        return "Unknown"

def resolve_coreferences(svos, entities):
    """Resolve pronouns in SVO triples using extracted entities."""
    resolved_svos = []
    for subj, verb, obj in svos:
        # Resolve subject pronouns
        if subj.lower() in ["he", "she", "they", "it"]:
            subj = entities.get("PERSON", ["Unknown"])[0]  # Default to the first PERSON entity
        # Resolve object pronouns
        if obj.lower() in ["him", "her", "them", "it"]:
            obj = entities.get("PERSON", ["Unknown"])[0]
        resolved_svos.append((subj, verb, obj))
    return resolved_svos

def extract_svo(text):
    """Extract Subject-Verb-Object triples from the text."""
    doc = nlp(text)
    svos = []
    for sent in doc.sents:
        for token in sent:
            if token.pos_ == "VERB" and token.dep_ not in ("aux", "auxpass"):  # Skip auxiliary verbs
                subj = None
                obj = None

                for child in token.children:
                    if child.dep_ in ("nsubj", "nsubjpass", "csubj"):
                        subj = child
                    if child.dep_ in ("dobj", "attr", "pobj", "xcomp", "ccomp", "obl"):
                        obj = child

                subj_span = " ".join([t.text for t in subj.subtree]) if subj else None
                obj_span = " ".join([t.text for t in obj.subtree]) if obj else None

                if subj_span and obj_span:
                    svos.append((subj_span, token.lemma_, obj_span))
    return svos

def build_knowledge_graph(entities, svos):
    """Build a knowledge graph using extracted entities and relationships."""
    graph = nx.DiGraph()

    # Add entities as nodes
    for entity_type, entity_list in entities.items():
        for entity in entity_list:
            graph.add_node(entity, type=entity_type)

    # Add relationships as edges
    for subj, verb, obj in svos:
        graph.add_edge(subj, obj, relationship=verb)

    return graph

def query_knowledge_graph(graph, query):
    """
    Query the knowledge graph to find answers to specific questions.
    :param graph: The knowledge graph (NetworkX DiGraph).
    :param query: The user's query as a string.
    :return: A list of answers.
    """
    doc = nlp(query)
    subject = None
    relationship = None

    # Extract the subject and relationship from the query
    for token in doc:
        if token.dep_ in ("nsubj", "pobj"):  # Subject of the query
            subject = token.text
        if token.pos_ == "VERB":  # Verb in the query
            relationship = token.lemma_

    if not subject or not relationship:
        return ["Sorry, I couldn't understand the query."]

    # Search the graph for matching relationships
    answers = []
    for source, target, data in graph.edges(data=True):
        if source.lower() == subject.lower() and data["relationship"] == relationship:
            answers.append(target)

    if not answers:
        return ["No information found for the given query."]
    return answers

def analyze_text(text):
    """Analyze the text and return extracted entities, relationships, and a knowledge graph."""
    logging.info("Extracting entities...")
    entities = extract_entities(text)

    logging.info("Extracting relationships...")
    svos = extract_svo(text)

    logging.info("Resolving coreferences...")
    resolved_svos = resolve_coreferences(svos, entities)

    logging.info("Building knowledge graph...")
    knowledge_graph = build_knowledge_graph(entities, resolved_svos)

    return entities, resolved_svos, knowledge_graph