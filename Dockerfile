FROM node:18.17.0-alpine AS node_builder
ENV NODE_ENV production

WORKDIR /app
COPY pdf-splitter-ui .

RUN npm install && npm run build

FROM python:3.10-slim-bookworm AS runner

RUN apt-get -y update \
    && apt-get install -y poppler-utils \
    && apt-get -y clean

WORKDIR /app

COPY pdf-splitter-api .
COPY --from=node_builder /app/build /app/static
RUN pip install -r requirements.txt

EXPOSE 5000
CMD gunicorn --bind 0.0.0.0:5000 wsgi:app
