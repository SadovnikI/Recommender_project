from django.core.management.base import BaseCommand


import pandas as pd
import re
from requests import get
from bs4 import BeautifulSoup

from movies.models import Movie


class Command(BaseCommand):

    help = 'Command to populate DB with movies'

    def handle(self, *args, **options):
        i_cols = ['movie id', 'movie title', 'release date', 'video release date',
                  'IMDb URL', 'unknown', 'Action', 'Adventure',
                  'Animation', 'Children\'s', 'Comedy', 'Crime', 'Documentary', 'Drama',
                  'Fantasy',
                  'Film-Noir', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
                  'Thriller', 'War', 'Western']

        items = pd.read_csv('./movies/management/commands/u.item', sep='|', names=i_cols, encoding='latin-1')

        headers = {'Accept-Language': 'en-US,en;q=0.8',
                   'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'}

        for item in items.values:
            print(item[0], item[1])
            print("All: ", Movie.objects.all().count())
            if not Movie.objects.filter(id = item[0]):
                url = "https://www.imdb.com/search/title/?title={}".format(
                    re.sub('[\(\[].*?[\)\]]', '', item[1]).replace(' ', '+'))
                try:
                    response = get(url, headers=headers)

                    if response.status_code != 200:
                        print(f'Request: Status code: {response.status_code}')

                    page_html = BeautifulSoup(response.text, 'html.parser')
                    movie_containers = page_html.find_all('div',
                                                          class_='lister-item mode-advanced')
                    container = movie_containers[0]

                    # /////
                    imdb_url = f"https://www.imdb.com{container.a.attrs['href']}"

                    response = get(imdb_url,
                                   headers=headers)

                    if response.status_code != 200:
                        print(f'Request: Status code: {response.status_code}')

                    page_html = BeautifulSoup(response.text, 'html.parser')
                    poster = page_html.find('img', class_='ipc-image').attrs['srcset'].split()[
                        -2]
                    print(item[0], poster, item[1], imdb_url)
                    Movie.objects.create(id=item[0], poster_url=poster, title=item[1],
                                         imdb_url=imdb_url)
                except Exception as e:
                    print("WARNING: " + str(e))




