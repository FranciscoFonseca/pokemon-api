FROM mysql:8.0

# Set the root password
ENV MYSQL_ROOT_PASSWORD=password

# Create a new database and user
ENV MYSQL_DATABASE=pokemonDB
ENV MYSQL_USER=ffonseca
ENV MYSQL_PASSWORD=password

# Add the SQL script to create the database and user
# COPY create_database.sql /docker-entrypoint-initdb.d/
