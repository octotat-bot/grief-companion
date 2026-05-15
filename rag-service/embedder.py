import json
import os

CORPUS_DIR = os.path.join(os.path.dirname(__file__), 'corpus')

def load_and_embed_corpus():
    """
    Loads all corpus JSON files into memory as plain dicts.
    No embeddings needed — TF-IDF vectorization happens at search time.
    Returns a list of document dicts.
    """
    documents = []
    if not os.path.exists(CORPUS_DIR):
        print(f"WARNING: Corpus directory not found at {CORPUS_DIR}")
        return documents

    for fname in os.listdir(CORPUS_DIR):
        if not fname.endswith('.json'):
            continue
        fpath = os.path.join(CORPUS_DIR, fname)
        try:
            with open(fpath, encoding='utf-8') as f:
                entries = json.load(f)
                documents.extend(entries)
        except Exception as e:
            print(f"Error loading {fname}: {e}")

    print(f"Loaded {len(documents)} corpus documents.")
    return documents
