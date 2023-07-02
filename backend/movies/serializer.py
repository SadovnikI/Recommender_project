from rest_framework import serializers

from movies.models import Movie


class MovieIdSerializer(serializers.Serializer):
    id_list = serializers.ListField(child=serializers.IntegerField(required=True))


class MovieSerializer(serializers.ModelSerializer):
    success = serializers.BooleanField(default=True)

    class Meta:
        model = Movie
        fields = '__all__'