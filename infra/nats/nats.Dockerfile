FROM nats:latest

COPY infra/nats/nats.conf /etc/nats/nats.conf

EXPOSE 4222
EXPOSE 8888
EXPOSE 6222

CMD ["nats-server", "-c", "/etc/nats/nats.conf"]