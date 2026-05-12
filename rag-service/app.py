# This is a small Python web server (Flask) that handles semantic search.
# It loads the corpus JSON files, embeds them into vectors,
# stores them in ChromaDB, and responds to search queries.

from flask import Flask, request, jsonify
from flask_cors import CORS
from embedder import load_and_embed_corpus
from retriever import search_corpus
import os
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

app = Flask(__name__)
CORS(app)

# Load corpus on startup
print("Loading and embedding corpus... (this takes ~30 seconds on first run)")
collection = load_and_embed_corpus()
print("Corpus ready.")

CLASSIFIER_DIR = os.path.join(os.path.dirname(__file__), 'classifier', 'classifier_model')
LABELS = ['condolence', 'apology', 'difficult_news', 'reconnection', 'eulogy']

classifier_model = None
classifier_tokenizer = None

def load_classifier():
    global classifier_model, classifier_tokenizer
    if not os.path.exists(CLASSIFIER_DIR):
        print("Classifier model not found. Run: python classifier/train.py")
        return
    try:
        classifier_tokenizer = DistilBertTokenizerFast.from_pretrained(CLASSIFIER_DIR)
        classifier_model = DistilBertForSequenceClassification.from_pretrained(CLASSIFIER_DIR)
        classifier_model.eval()
        print("Classifier model loaded.")
    except Exception as e:
        print(f"Failed to load classifier: {e}")

load_classifier()

@app.route('/classify', methods=['POST'])
def classify():
    if classifier_model is None or classifier_tokenizer is None:
        return jsonify({"label": None, "available": False, "message": "Classifier not trained yet. Run python classifier/train.py"})

    data = request.get_json()
    text = data.get('text', '').strip()

    if not text or len(text) < 5:
        return jsonify({"error": "text too short"}), 400

    inputs = classifier_tokenizer(
        text,
        return_tensors='pt',
        truncation=True,
        padding=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = classifier_model(**inputs)

    probs = torch.softmax(outputs.logits, dim=-1)[0]
    pred_id = torch.argmax(probs).item()
    predicted_label = LABELS[pred_id]
    confidence = round(probs[pred_id].item(), 3)

    all_scores = {label: round(probs[i].item(), 3) for i, label in enumerate(LABELS)}

    return jsonify({
        "label": predicted_label,
        "confidence": confidence,
        "all_scores": all_scores,
        "available": True
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "corpus_loaded": collection is not None})

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    
    query = data.get('query', '')
    situation_type = data.get('situation_type', None)
    limit = min(data.get('limit', 3), 5)  # Max 5 results
    
    if not query:
        return jsonify({"error": "query is required"}), 400
    
    results = search_corpus(collection, query, situation_type, limit)
    return jsonify({"results": results})

if __name__ == '__main__':
    app.run(port=5001, debug=False)
