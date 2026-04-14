import os
from typing import List

import chromadb
import numpy as np
from django.conf import settings
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline

from .models import Book

EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
LLM_MODEL_NAME = os.getenv("LLM_MODEL", "google/flan-t5-base")
CHROMA_DIR = os.getenv("CHROMA_DIR", str(settings.BASE_DIR / "chroma_store"))

_embedder = SentenceTransformer(EMBED_MODEL_NAME)
_chroma = chromadb.PersistentClient(path=CHROMA_DIR)
_collection = _chroma.get_or_create_collection(name="book_descriptions")
_generator = pipeline("text2text-generation", model=LLM_MODEL_NAME)


def chunk_text(text: str, chunk_size: int = 220, overlap: int = 40) -> List[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    i = 0
    while i < len(words):
        chunks.append(" ".join(words[i : i + chunk_size]))
        i += chunk_size - overlap
    return chunks


def index_book(book: Book):
    chunks = chunk_text(book.description)
    if not chunks:
        return

    embeddings = _embedder.encode(chunks).tolist()
    ids = [f"book-{book.id}-chunk-{i}" for i in range(len(chunks))]
    metadatas = [{"book_id": str(book.id), "title": book.title} for _ in chunks]

    _collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def ask_question(question: str, top_k: int = 4):
    books = list(Book.objects.all()[:50])
    if not books:
        return {"answer": "No books available.", "context": []}

    context_lines = [
        f"{b.title or 'Untitled Book'} - {(b.description or 'No description available')} (Rating: {b.rating})"
        for b in books
    ]
    fallback_context = "\n".join(context_lines)

    q_emb = _embedder.encode([question]).tolist()[0]
    result = _collection.query(query_embeddings=[q_emb], n_results=top_k)
    docs = result.get("documents", [[]])[0]
    useful_docs = [doc.strip() for doc in docs if doc and len(doc.strip().split()) >= 8]
    context = "\n\n".join(useful_docs) if useful_docs else fallback_context

    prompt = f"""
You are a helpful assistant.
Answer using the provided book data.
If books exist, list them clearly and be concise.

Context:
{context}

Question: {question}
Answer:
""".strip()

    llm_out = _generator(prompt, max_new_tokens=120, do_sample=False)
    answer = llm_out[0]["generated_text"] if llm_out else "Not enough information available"

    return {"answer": answer, "context": useful_docs or context_lines[:top_k]}


def generate_summary(description: str):
    if not description or len(description.split()) < 25:
        return "Not enough information to generate summary"

    prompt = f"""
You are an editorial assistant.
Summarize the book description below in exactly 2-3 meaningful lines.
Focus on the core theme, likely audience, and key value.
Avoid generic phrases and do not invent facts.

Description:
{description}
""".strip()

    out = _generator(prompt, max_new_tokens=80, do_sample=False)
    return out[0]["generated_text"] if out else "Summary unavailable."


def recommend_similar(book_id: int, k: int = 5):
    books = list(Book.objects.all())
    target = next((b for b in books if b.id == book_id), None)
    if not target:
        return []

    corpus = [b.description or b.title for b in books]
    embeddings = _embedder.encode(corpus)
    idx = books.index(target)
    sims = cosine_similarity([embeddings[idx]], embeddings)[0]

    ranked_idx = np.argsort(sims)[::-1]
    recs = []
    for i in ranked_idx:
        if books[i].id == target.id:
            continue
        recs.append(books[i])
        if len(recs) >= k:
            break
    return recs
