from django.urls import path
from . import views

urlpatterns = [
    path("", views.home),
    path("books", views.books_list),
    path("books/<int:pk>", views.BookDetailView.as_view()),
    path("books/upload", views.books_upload),
    path("ask", views.ask),
]
