import re
from collections import Counter
import math

def tokenize(text):
    return re.findall(r'\b[a-z]{3,}\b', text.lower())

def tfidf_score(query_tokens, doc_tokens, all_docs_tokens):
    doc_counter = Counter(doc_tokens)
    scores = []
    for term in set(query_tokens):
        tf = doc_counter.get(term, 0) / (len(doc_tokens) + 1)
        docs_with_term = sum(1 for d in all_docs_tokens if term in d)
        idf = math.log((len(all_docs_tokens) + 1) / (docs_with_term + 1))
        scores.append(tf * idf)
    return sum(scores)

def search_corpus(documents, query, situation_type=None, limit=3):
    if not documents:
        return []

    filtered = [d for d in documents if not situation_type or d.get('type') == situation_type]
    if not filtered:
        filtered = documents

    query_tokens = tokenize(query)
    all_tokens = [tokenize(d['text']) for d in filtered]

    scored = []
    for i, doc in enumerate(filtered):
        score = tfidf_score(query_tokens, all_tokens[i], all_tokens)
        scored.append((score, doc))

    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            'text': doc['text'],
            'similarity': round(score, 3),
            'metadata': {
                'type': doc.get('type', ''),
                'relationship': doc.get('relationship', ''),
                'tone': doc.get('tone', ''),
                'cultural_context': doc.get('cultural_context', 'neutral')
            }
        }
        for score, doc in scored[:limit]
        if score > 0
    ]
