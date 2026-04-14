from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, default="Unknown Author")
    description = models.TextField(blank=True, default="")
    rating = models.FloatField(default=0.0)
    url = models.URLField(unique=True)
    image_url = models.URLField(blank=True, default="")

    def __str__(self):
        return self.title
