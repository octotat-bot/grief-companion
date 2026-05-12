# This script fine-tunes a DistilBERT model on your labeled dataset.
# Run it ONCE to produce a trained model saved to ./classifier_model/
# After training, the model is served by the Flask app for real-time predictions.
#
# DistilBERT is a smaller, faster version of BERT — same capability, 40% smaller.
# Fine-tuning means we take a model already trained on billions of words of text
# and teach it our specific 5-class classification task by training for a few more epochs
# on our small labeled dataset.
#
# Hardware: runs on CPU. Training 60 examples for 5 epochs takes ~3-5 minutes.
# No GPU needed.

import json
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)
import torch
from torch.utils.data import Dataset

# Label mapping — consistent order matters. Don't change after training.
LABELS = ['condolence', 'apology', 'difficult_news', 'reconnection', 'eulogy']
LABEL2ID = {l: i for i, l in enumerate(LABELS)}
ID2LABEL = {i: l for i, l in enumerate(LABELS)}

MODEL_NAME = 'distilbert-base-uncased'
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'classifier_model')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'training_data.json')

class EmotionDataset(Dataset):
    """Wraps tokenized examples for PyTorch training."""
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

def load_data():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    texts = [d['text'] for d in data]
    labels = [LABEL2ID[d['label']] for d in data]
    return texts, labels

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    report = classification_report(labels, predictions, target_names=LABELS, output_dict=True)
    return {
        'accuracy': report['accuracy'],
        'macro_f1': report['macro avg']['f1-score']
    }

def main():
    print("Loading data...")
    texts, labels = load_data()
    print(f"Loaded {len(texts)} examples across {len(LABELS)} classes.")

    # Split into train/validation sets (80/20)
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    print(f"Train: {len(train_texts)} | Validation: {len(val_texts)}")

    # Tokenize — convert text to numbers the model understands
    print("Tokenizing...")
    tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_NAME)
    train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=128)
    val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=128)

    train_dataset = EmotionDataset(train_encodings, train_labels)
    val_dataset = EmotionDataset(val_encodings, val_labels)

    # Load pre-trained DistilBERT with a classification head for 5 classes
    print("Loading DistilBERT model...")
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID
    )

    # Training configuration
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=16,
        warmup_steps=10,
        weight_decay=0.01,
        logging_dir=os.path.join(OUTPUT_DIR, 'logs'),
        eval_strategy='epoch',        # ← was 'evaluation_strategy', renamed in transformers 4.38+
        save_strategy='epoch',
        load_best_model_at_end=True,
        metric_for_best_model='macro_f1',
        report_to='none',
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics
    )

    print("Training... (this takes ~3-5 minutes on CPU)")
    trainer.train()

    print("Saving model...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # Final evaluation
    print("\nFinal evaluation on validation set:")
    val_texts_raw, val_labels_raw = zip(*[
        (val_texts[i], LABELS[val_labels[i]]) for i in range(len(val_texts))
    ])
    predictions = []
    for text in val_texts_raw:
        inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
        pred_id = torch.argmax(outputs.logits, dim=-1).item()
        predictions.append(LABELS[pred_id])

    print(classification_report(val_labels_raw, predictions, target_names=LABELS))
    print(f"\nModel saved to {OUTPUT_DIR}")
    print("You can now start the Flask app — it will load this model for predictions.")

if __name__ == '__main__':
    main()
