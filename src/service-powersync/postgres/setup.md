## Replication Setup

postgres.conf

```
wal_level=logical
listen_addresses='*'
```

```sql
CREATE PUBLICATION powersync FOR ALL TABLES;
```

## Storage Setup

```sql
CREATE USER powersync_storage WITH PASSWORD 'powersync_storage';
CREATE DATABASE powersync_storage WITH OWNER powersync_storage;
```
