
FROM python:3

ENV PYTHONBUFFERED 1

RUN mkdir /backend

WORKDIR /backend

COPY ./backend /backend

# RUN pip install -r requirements.txt

RUN python -m pip install --upgrade pip
RUN python -m pip install django
RUN python -m pip install psycopg2
RUN python -m pip install django-crispy-forms
RUN python -m pip install djangorestframework
RUN python -m pip install djangorestframework-jwt
RUN python -m pip install Pillow
RUN python -m pip install mysqlclient
RUN python -m pip install django-mysql
RUN python -m pip install pandas
RUN python -m pip install bs4
RUN python -m pip install requests
RUN python -m pip install django-cors-headers