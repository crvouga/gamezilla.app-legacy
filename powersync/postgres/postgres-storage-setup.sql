-- storage setup
CREATE USER powersync_storage_user WITH PASSWORD 'powersync_storage_user';
GRANT CREATE ON DATABASE postgres TO powersync_storage_user;
GRANT CREATE ON DATABASE "gamezilla-app" TO powersync_storage_user;

-- publication setup
CREATE PUBLICATION powersync FOR ALL TABLES;