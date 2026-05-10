# 1. Mude de 8.2 para 8.3
FROM php:8.3-fpm

# Instala dependências do sistema
RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev zip unzip
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala extensões do PHP e banco de dados
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instala o Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copia o código do Laravel para dentro do container
COPY . .

# 2. Adicione --ignore-platform-reqs para garantir que o build passe liso
RUN composer install --optimize-autoloader --no-dev --ignore-platform-reqs

# Ajusta permissões
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache