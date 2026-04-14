from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Book
from .scraper import scrape_books
from .serializers import BookSerializer

PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x400?text=No+Image"


def classify_genre(description: str) -> str:
    text = (description or "").lower()
    rules = [
        ("Fantasy", ["magic", "dragon", "wizard", "kingdom", "sorcery", "myth"]),
        ("Romance", ["love", "romance", "heart", "relationship", "passion"]),
        ("Science", ["science", "physics", "chemistry", "biology", "experiment", "space"]),
        ("History", ["history", "war", "empire", "ancient", "historical", "civilization"]),
        ("Mystery", ["murder", "mystery", "detective", "crime", "investigation"]),
        ("Self-Help", ["self-help", "habits", "mindset", "productivity", "motivation"]),
        ("Fiction", ["novel", "story", "fiction", "character", "journey"]),
    ]
    for genre, keywords in rules:
        if any(keyword in text for keyword in keywords):
            return genre
    return "General"


@api_view(["GET"])
def home(request):
    return Response({"message": "Backend is running"})


@api_view(["GET"])
def books_list(request):
    books = Book.objects.all().order_by("-id")
    data = BookSerializer(books, many=True).data
    for item in data:
        if not item.get("image_url"):
            item["image_url"] = PLACEHOLDER_IMAGE
        item["genre"] = classify_genre(item.get("description", ""))
    return Response(data)


class BookDetailView(APIView):
    def get(self, request, pk):
        book = Book.objects.filter(pk=pk).first()
        if not book:
            return Response({"error": "Book not found"}, status=404)

        base_data = {
            "id": book.id,
            "title": book.title or "Untitled Book",
            "author": book.author or "Unknown Author",
            "description": book.description or "No description available",
            "rating": book.rating,
            "image_url": book.image_url or PLACEHOLDER_IMAGE,
            "url": book.url,
            "genre": classify_genre(book.description),
        }

        try:
            from .rag import generate_summary, recommend_similar

            base_data["summary"] = generate_summary(book.description)
            similar_books = BookSerializer(recommend_similar(book.id), many=True).data
            for item in similar_books:
                item["genre"] = classify_genre(item.get("description", ""))
            base_data["similar_books"] = similar_books
        except Exception:
            base_data["summary"] = "Summary temporarily unavailable."
            base_data["similar_books"] = []
        return Response(base_data)


@api_view(["POST"])
def books_upload(request):
    limit = int(request.data.get("limit", 20))
    scraped = scrape_books(limit=limit)
    if not scraped:
        return Response({"message": "Fallback data used", "created": 0, "updated": 0, "fetched": 0})

    created = 0
    updated = 0

    for item in scraped:
        book, was_created = Book.objects.update_or_create(url=item["url"], defaults=item)
        if was_created:
            created += 1
        else:
            updated += 1
        try:
            from .rag import index_book

            index_book(book)
        except Exception:
            # Keep upload successful even when vector indexing dependencies are unavailable.
            pass

    return Response({"message": "Upload complete", "created": created, "updated": updated, "fetched": len(scraped)})


@api_view(["POST"])
def ask(request):
    question = request.data.get("question", "").strip()
    if not question:
        return Response({"error": "question is required"}, status=status.HTTP_400_BAD_REQUEST)

    books = list(Book.objects.all())
    if not books:
        return Response({"answer": "No books available.", "context": []})

    normalized_q = question.lower()
    is_general_catalog_query = any(
        key in normalized_q
        for key in [
            "what books",
            "books are available",
            "available books",
            "list books",
            "show books",
            "all books",
        ]
    )

    if is_general_catalog_query:
        listed_titles = "\n".join(
            f"- {book.title or 'Untitled Book'}" for book in books
        )
        return Response({"answer": f"Available books:\n{listed_titles}", "context": [b.title for b in books]})

    try:
        from .rag import ask_question

        result = ask_question(question)
        answer_text = (result or {}).get("answer", "") if isinstance(result, dict) else ""
        if "not enough information" in answer_text.lower():
            listed_titles = "\n".join(
                f"- {book.title or 'Untitled Book'}" for book in books
            )
            return Response({"answer": f"Available books:\n{listed_titles}", "context": [b.title for b in books]})
        return Response(result)
    except Exception:
        # Fallback: return a meaningful answer based on available catalog data.
        listed_titles = "\n".join(
            f"- {book.title or 'Untitled Book'}" for book in books
        )
        return Response({"answer": f"Available books:\n{listed_titles}", "context": [b.title for b in books]})
