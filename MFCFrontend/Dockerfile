# Bước 1: Build stage
FROM node:20.19.0-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM httpd:2.4-alpine

COPY --from=build /app/dist/ /usr/local/apache2/htdocs/

RUN echo '<Directory "/usr/local/apache2/htdocs/">' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    Options Indexes FollowSymLinks' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    AllowOverride All' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    Require all granted' >> /usr/local/apache2/conf/httpd.conf && \
    echo '</Directory>' >> /usr/local/apache2/conf/httpd.conf

RUN echo 'Options -MultiViews' > /usr/local/apache2/htdocs/.htaccess && \
    echo 'RewriteEngine On' >> /usr/local/apache2/htdocs/.htaccess && \
    echo 'RewriteCond %{REQUEST_FILENAME} !-f' >> /usr/local/apache2/htdocs/.htaccess && \
    echo 'RewriteRule ^ index.html [QSA,L]' >> /usr/local/apache2/htdocs/.htaccess

RUN echo 'ServerName localhost' >> /usr/local/apache2/conf/httpd.conf

RUN sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf

EXPOSE 80

CMD ["httpd-foreground"] 