import spacy
import re

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
            if token.pos_ == "VERB":
                subj = None
                obj = None

                for child in token.children:
                    if child.dep_ in ("nsubj", "nsubjpass"):
                        subj = child

                    if child.dep_ in ("dobj", "attr", "pobj", "xcomp", "ccomp"):
                        obj = child

                if subj and obj:
                    subj_span = " ".join(w.text for w in subj.subtree)
                    obj_span = " ".join(w.text for w in obj.subtree)
                    subj_clean, verb_clean, obj_clean = clean_svo(subj_span, token.lemma_, obj_span)
                    if verb_clean in ["say", "write", "expect"] and obj_clean == "(unspecified)":
                        continue
                    if subj_clean and verb_clean and obj_clean:
                        svos.append((subj_clean, verb_clean, obj_clean))
    return svos

def resolve_coreferences(svo_list, entities):
    resolved_svos = []
    last_person = None
    last_org = None

    for subj, verb, obj in svo_list:
        if subj.lower() in ["which", "however", "this"]: continue
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

def clean_svo(subj, verb, obj, max_len=8):
    # Remove leading/trailing punctuation
    subj = subj.strip(" ,“”\"'")
    obj = obj.strip(" ,“”\"'")

    # Remove embedded or trailing clauses
    obj = re.split(r",\s*(which|that|who|however|although)", obj)[0]
    subj = re.split(r",\s*(which|that|who|however|although)", subj)[0]

    # Remove known vague intros
    for phrase in ["that ", "who ", "however ", "moreover ", "it to have "]:
        obj = obj.replace(phrase, "")
        subj = subj.replace(phrase, "")

    # Truncate long spans
    subj_tokens = subj.split()
    obj_tokens = obj.split()

    if len(subj_tokens) > max_len:
        subj = " ".join(subj_tokens[:max_len]) + "..."

    if len(obj_tokens) > max_len:
        obj = " ".join(obj_tokens[:max_len]) + "..."

    # Fallback if object is empty or nonsense
    if not obj or obj.lower() in ["“", "”", "''", '""', '(', ')']:
        obj = "(unspecified)"

    return subj, verb, obj
