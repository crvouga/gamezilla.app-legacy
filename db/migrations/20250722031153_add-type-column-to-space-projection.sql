-- migrate:up

ALTER TABLE space_projection ADD COLUMN type TEXT;

UPDATE space_projection SET type = 'initial';

ALTER TABLE space_projection ALTER COLUMN type SET NOT NULL;

-- migrate:down

ALTER TABLE space_projection DROP COLUMN type;
