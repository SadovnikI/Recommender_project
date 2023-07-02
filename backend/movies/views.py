from django.shortcuts import get_object_or_404
from rest_framework.generics import GenericAPIView
from movies.models import Movie
from movies.serializer import MovieSerializer, MovieIdSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework import filters


class MovieListAPIView(GenericAPIView):

    def get(self, request):
        ids = self.request.query_params.get('movie_ids', default=[])

        if ids:
            ids = ids.split(',')

        input_serializer = MovieIdSerializer(data={'id_list': ids})
        if input_serializer.is_valid(raise_exception=True):
            return Response(
                MovieSerializer(
                    Movie.objects.filter(id__in=input_serializer.data['id_list']),
                    many=True
                ).data,
                status=status.HTTP_200_OK
            )


class MovieAPIView(GenericAPIView):

    def get(self, request, id):
        movie_object = get_object_or_404(Movie, id=id)
        return Response(
            MovieSerializer(
                movie_object
            ).data,
            status=status.HTTP_200_OK
        )


class MovieSearchAPIView(ListAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def finalize_response(self, request, response, *args, **kwargs):
        response.data = response.data[:5]
        return super().finalize_response(request, response, *args, **kwargs)