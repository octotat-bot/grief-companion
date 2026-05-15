from flask import Flask, request, jsonify
from flask_cors import CORS
from embedder import load_and_embed_corpus
from retriever import search_corpus
import os

app = Flask(__name__)
CORS(app)

print("Loading corpus...")
documents = load_and_embed_corpus()
print(f"Ready. {len(documents)} documents loaded.")

@app.route('/health')
def health():
    return jsonify({"status": "ok", "doc_count": len(documents)})

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query', '').strip()
    situation_type = data.get('situation_type')
    limit = min(int(data.get('limit', 3)), 5)

    if not query:
        return jsonify({"error": "query required"}), 400

    results = search_corpus(documents, query, situation_type, limit)
    return jsonify({"results": results})

@app.route('/classify', methods=['POST'])
def classify():
    # Classifier not available in lightweight mode
    # Returns unavailable so frontend gracefully degrades
    return jsonify({"label": None, "available": False,
                    "message": "Classifier not available in lightweight deployment"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
