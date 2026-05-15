from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def search_corpus(documents, query, situation_type=None, limit=3):
    if not documents:
        return []

    # Filter by situation type if provided
    filtered = [d for d in documents if not situation_type or d.get('type') == situation_type]
    if not filtered:
        filtered = documents  # fallback to all if filter returns nothing

    texts = [d['text'] for d in filtered]

    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(texts + [query])
        scores = cosine_similarity(matrix[-1], matrix[:-1])[0]

        top_indices = np.argsort(scores)[::-1][:limit]

        results = []
        for i in top_indices:
            if scores[i] > 0.05:  # minimum relevance threshold
                results.append({
                    'text': filtered[i]['text'],
                    'similarity': round(float(scores[i]), 3),
                    'metadata': {
                        'type': filtered[i].get('type', ''),
                        'relationship': filtered[i].get('relationship', ''),
                        'tone': filtered[i].get('tone', ''),
                        'cultural_context': filtered[i].get('cultural_context', 'neutral')
                    }
                })
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return []
