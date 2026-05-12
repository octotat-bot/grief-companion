# This file loads all the JSON corpus files and embeds them
# into a ChromaDB vector database for semantic search.
# Embeddings are persisted to disk so they only compute once.

import json
import os
import chromadb
from sentence_transformers import SentenceTransformer

CORPUS_DIR = os.path.join(os.path.dirname(__file__), 'corpus')
CHROMA_DIR = os.path.join(os.path.dirname(__file__), 'chroma_db')

# This model is free and small (~90MB). It understands semantic meaning.
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'

def load_and_embed_corpus():
    # Initialize ChromaDB with persistent storage
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    
    # If collection already exists with data, return it (skip re-embedding)
    try:
        collection = client.get_collection("grief_corpus")
        if collection.count() > 0:
            print(f"Loaded existing collection with {collection.count()} documents.")
            return collection
    except Exception:
        pass
    
    # Create new collection
    collection = client.get_or_create_collection(
        name="grief_corpus",
        metadata={"hnsw:space": "cosine"}
    )
    
    # Load embedding model
    model = SentenceTransformer(EMBEDDING_MODEL)
    
    # Load all corpus files
    corpus_files = [f for f in os.listdir(CORPUS_DIR) if f.endswith('.json')]
    all_documents = []
    all_ids = []
    all_metadatas = []
    
    for filename in corpus_files:
        filepath = os.path.join(CORPUS_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            entries = json.load(f)
        
        for entry in entries:
            all_documents.append(entry['text'])
            all_ids.append(entry['id'])
            all_metadatas.append({
                'type': entry.get('type', ''),
                'relationship': entry.get('relationship', ''),
                'tone': entry.get('tone', ''),
                'cultural_context': entry.get('cultural_context', 'neutral'),
                'tags': ','.join(entry.get('tags', []))
            })
    
    if not all_documents:
        print("WARNING: No corpus documents found. Check the corpus/ folder.")
        return collection
    
    # Embed all documents
    print(f"Embedding {len(all_documents)} corpus documents...")
    embeddings = model.encode(all_documents, show_progress_bar=True).tolist()
    
    # Add to ChromaDB
    collection.add(
        documents=all_documents,
        embeddings=embeddings,
        ids=all_ids,
        metadatas=all_metadatas
    )
    
    print(f"Embedded and stored {len(all_documents)} documents.")
    return collection
