## Pull the mariadb image
FROM mariadb

## The maintainer name and email
MAINTAINER Martin Ambrueso <martinambrueso@hotmail.com>

# database = csmeli and password for root = password
ENV MYSQL_DATABASE=csmeli \
    MYSQL_ROOT_PASSWORD=password

# when container will be started, we'll have `csmeli` database created with this schema
COPY ./init.sql /docker-entrypoint-initdb.d/