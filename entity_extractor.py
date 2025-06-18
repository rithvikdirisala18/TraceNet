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
        for token in sent:
            # Look for verbs with a subject
            if token.pos_ == "VERB":
                subj = None
                obj = None

                for child in token.children:
                    if child.dep_ in ("nsubj", "nsubjpass"):
                        subj = child

                    if child.dep_ in ("dobj", "attr", "pobj", "xcomp", "ccomp"):
                        obj = child

                if subj and obj:
                    # Get full phrases (not just single words)
                    subj_span = " ".join(w.text for w in subj.subtree)
                    obj_span = " ".join(w.text for w in obj.subtree)
                    svos.append((subj_span, token.lemma_, obj_span))

    return svos

def resolve_coreferences(svo_list, entities):
    resolved_svos = []
    last_person = None
    last_org = None

    for subj, verb, obj in svo_list:
        # Replace pronoun subjects
        if subj.lower() in ["he", "she", "they", "it"]:
            if last_person:
                subj = last_person
            elif last_org:
                subj = last_org

        # Replace pronoun objects
        if obj.lower() in ["he", "she", "they", "it", "this", "that"]:
            if last_person:
                obj = last_person
            elif last_org:
                obj = last_org

        # Update last seen person/org
        for person in entities.get("PERSON", []):
            if person in subj:
                last_person = person
        for org in entities.get("ORG", []):
            if org in subj:
                last_org = org

        resolved_svos.append((subj, verb, obj))

    return resolved_svos
