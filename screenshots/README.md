# Screenshots Placeholder

Add your project screenshots in this folder before final GitHub submission.

Recommended files:
- `dashboard.png`
- `book-detail.png`
- `chat.png`
- `scrape-success.png`

After adding images, reference them in the root `README.md` under the **Screenshots** section.

---

## Live Workflow

The app flow is simple and user-friendly:

1. The user clicks **Scrape & Upload**.
2. The backend scrapes book data from the configured source.
3. Scraped data is stored in the database.
4. The user clicks a book to open its detail page.
5. The user asks a question, and the RAG flow generates an answer.

## RAG Pipeline Explanation

When a user asks a question, the system follows these steps:

1. Convert the question into an embedding.
2. Retrieve the most relevant books/documents from the database.
3. Build a context from the retrieved content.
4. Generate a final answer using the LLM based on that context.

## Error Handling

The project includes practical safeguards for reliability:

- **Scraper fallback:** If the source site is unavailable or fails, the scraper uses fallback handling to avoid complete failure.
- **Image fallback:** If a book image is missing or broken, a safe fallback image/path is used.
- **Safe API responses:** APIs return controlled error messages and status codes to prevent crashes and improve client-side handling.

## Future Improvements

- Integrate a more advanced LLM pipeline for higher-quality answers.
- Improve and verify real author metadata during scraping.
- Deploy to cloud infrastructure for production-scale usage.
- Add user authentication and role-based access control.
- Store and display chat history for better user continuity.
