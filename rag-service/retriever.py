# This file handles the actual semantic search.
# It embeds the user's query and finds the most similar corpus examples.

from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
_model = None  # Cached model — only load once

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model

def search_corpus(collection, query, situation_type=None, limit=3):
    model = get_model()
    
    # Embed the query
    query_embedding = model.encode([query])[0].tolist()
    
    # Build filter if situation_type is specified
    where_filter = None
    if situation_type and situation_type in ['condolence', 'apology', 'difficult_news', 'reconnection', 'eulogy']:
        where_filter = {"type": {"$eq": situation_type}}
    
    # Search ChromaDB
    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(limit, collection.count()),
            where=where_filter,
            include=['documents', 'metadatas', 'distances']
        )
    except Exception as e:
        print(f"Search error: {e}")
        return []
    
    # Format results
    formatted = []
    if results['documents'] and results['documents'][0]:
        for i, doc in enumerate(results['documents'][0]):
            similarity = 1 - results['distances'][0][i]  # Convert distance to similarity
            if similarity > 0.2:  # Only return reasonably similar results
                formatted.append({
                    'text': doc,
                    'similarity': round(similarity, 3),
                    'metadata': results['metadatas'][0][i]
                })
    
    return formatted
