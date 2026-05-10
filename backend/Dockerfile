FROM php:8.2-fpm

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

# Instala as dependências do Laravel
RUN composer install --optimize-autoloader --no-dev

# Ajusta permissões
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache