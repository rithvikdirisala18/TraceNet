import spacy

nlp = spacy.load("en_core_web_trf")

def extract_entities(text):
    doc = nlp(text)
    entities = {"PERSON": set(), "ORG": set(), "GPE": set()}
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].add(ent.text)
    return {k: list(v) for k, v in entities.items()}

def extract_svo(text):
    doc = nlp(text)
    svos = []
    for sent in doc.sents:
        subj = ""
        verb = ""
        obj = ""
        for token in sent:
            if "subj" in token.dep_:
                subj = token.text
            if token.pos_ == "VERB":
                verb = token.lemma_
            if "obj" in token.dep_:
                obj = token.text
        if subj and verb and obj:
            svos.append((subj, verb, obj))
    return svos