FROM php:8.4-fpm

RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-dev --no-interaction

# Symlink public/storage → ../storage/app/public para servir uploads (avatares etc).
# A pasta storage/ vira volume em runtime; o symlink em public/ persiste no bind-mount.
RUN php artisan storage:link

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
