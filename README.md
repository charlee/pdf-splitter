PDF splitter
================

This is a simple web service that allows you to split a PDF file into multiple PNG files, using the white spaces between lines.

**Note**: This service is a simple tool that I created to help me with a specific task. It is not optimized for performance,
and it is _not secure_. DO NOT use it in a production environment or as a public service.

## How to use

Use the following `docker-compose.yml`:

```yaml
version: '3.3'
services:
  pdf-splitter:
    image: odacharlee/pdf-splitter
    restart: always
    ports:
      - '5000:5000'
    # volumes:
    #   - ./cache:/app/cache
    #   - ./downloads:/app/downloads
```


Optionally, you can map the `/app/cache` and `/app/downloads` directories to your host machine to persist the cache and the downloaded files.

Then, run the following command:

```bash
$ docker-compose up -d
```
