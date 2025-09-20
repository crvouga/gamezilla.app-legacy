FROM nats:2.10-alpine
COPY nats.conf /etc/nats/nats.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 4222 9222 8222
CMD ["/start.sh"]
