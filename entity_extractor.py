import spacy

nlp = spacy.load("en_core_web_trf")

def extract_entities(text):
    doc = nlp(text)
    entities = {"PERSON": set(), "ORG": set(), "GPE": set()}
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].add(ent.text)
    return {k: list(v) for k, v in entities.items()}