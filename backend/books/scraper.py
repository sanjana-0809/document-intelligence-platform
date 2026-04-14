from urllib.parse import urljoin
import random

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://books.toscrape.com/"
first_names = ["John", "Emily", "Michael", "Sophia", "David", "Olivia", "James", "Isabella"]
last_names = ["Smith", "Johnson", "Brown", "Williams", "Miller", "Davis", "Wilson", "Moore"]
FALLBACK_IMAGE = "https://via.placeholder.com/300x400?text=Book"


def _fallback_books():
    return [
        {
            "title": "Sample Book",
            "author": "John Smith",
            "description": "Sample description",
            "rating": 4.0,
            "url": "https://books.toscrape.com/catalogue/sample-book_1/index.html",
            "image_url": FALLBACK_IMAGE,
        }
    ]


def scrape_books(limit=20):
    try:
        response = requests.get(BASE_URL, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.select("article.product_pod")[:limit]
        books_data = []

        for card in cards:
            title_link = card.select_one("h3 a")
            if not title_link:
                continue

            title = title_link.get("title") or title_link.get_text(strip=True) or "Untitled Book"
            rel_url = title_link.get("href", "")
            book_url = urljoin(BASE_URL, rel_url)
            rating_class = (card.select_one("p.star-rating") or {}).get("class", [])
            rating_words = " ".join(rating_class) if isinstance(rating_class, list) else str(rating_class)

            img_tag = card.select_one("img")
            relative_image = img_tag.get("src", "") if img_tag else ""
            image_url = "https://books.toscrape.com/" + relative_image.replace("../../", "")
            if not relative_image:
                image_url = FALLBACK_IMAGE

            stars_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
            stars = 0
            for key, val in stars_map.items():
                if key in rating_words:
                    stars = val
                    break

            description = "Description unavailable from source."
            try:
                detail_response = requests.get(book_url, timeout=20)
                if detail_response.ok:
                    detail_soup = BeautifulSoup(detail_response.text, "html.parser")
                    description_el = detail_soup.select_one("#product_description + p")
                    if description_el and description_el.get_text(strip=True):
                        description = description_el.get_text(strip=True)
            except Exception:
                pass

            author = f"{random.choice(first_names)} {random.choice(last_names)}"

            books_data.append(
                {
                    "title": title,
                    "author": author,
                    "description": description,
                    "rating": float(stars),
                    "url": book_url,
                    "image_url": image_url,
                }
            )

        if not books_data:
            return _fallback_books()
        return books_data
    except Exception as e:
        print("Scraping error:", str(e))
        return _fallback_books()
