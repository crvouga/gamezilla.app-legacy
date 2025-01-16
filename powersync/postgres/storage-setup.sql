CREATE USER 'powersync-storage-user' WITH PASSWORD 'powersync-storage-user';
GRANT CREATE ON DATABASE postgres TO 'powersync-storage-user';
GRANT CREATE ON DATABASE "gamezilla-app" TO 'powersync-storage-user';