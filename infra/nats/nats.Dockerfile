FROM nats:2.10-alpine

COPY ./infra/nats/nats.conf /etc/nats/nats.conf
COPY ./infra/nats/start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 4222 9222 8222

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8222/healthz || exit 1

CMD ["/start.sh"]
