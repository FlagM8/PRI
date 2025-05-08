FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libxslt-dev \
    && docker-php-ext-install pdo pdo_sqlite xsl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

RUN chmod -R 755 /var/www/html \
    && chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html