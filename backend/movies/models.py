from django.db import models

class Movie(models.Model):
    id = models.IntegerField(primary_key=True, null=False)
    poster_url = models.URLField(null=False)
    title = models.TextField(null=False)
    imdb_url = models.URLField(null=False)
