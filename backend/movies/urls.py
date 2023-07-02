from django.urls import path

from movies.views import MovieListAPIView, MovieAPIView, MovieSearchAPIView

urlpatterns = [
    path('movie_list', MovieListAPIView.as_view(), name='movie_list'),
    path('movie/<str:id>', MovieAPIView.as_view(), name='movie'),
    path('search', MovieSearchAPIView.as_view(), name='movie_search'),
    ]
