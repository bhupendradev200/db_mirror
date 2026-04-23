FROM mysql:8.0

COPY ./replica-1/my.cnf /etc/mysql/conf.d/my.cnf
COPY ./init/01-configure-replication.sh /docker-entrypoint-initdb.d/01-configure-replication.sh

RUN chmod 644 /etc/mysql/conf.d/my.cnf && chmod +x /docker-entrypoint-initdb.d/01-configure-replication.sh
