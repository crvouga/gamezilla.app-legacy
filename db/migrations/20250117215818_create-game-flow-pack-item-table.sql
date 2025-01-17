-- migrate:up

CREATE TABLE game_flow_pack_item (
    id TEXT PRIMARY KEY,
    pack_id TEXT NOT NULL,
    puzzle_id TEXT NOT NULL,
    position BIGINT NOT NULL,
    created_at_posix BIGINT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    deleted_at_posix BIGINT,
    deleted_by_user_id TEXT
);

CREATE INDEX idx_game_flow_pack_item_pack_id_not_deleted 
ON game_flow_pack_item(pack_id) 
WHERE deleted_at_posix IS NULL;


INSERT INTO game_flow_pack_item (
    id,
    pack_id,
    puzzle_id,
    position,
    created_at_posix,
    created_by_user_id,
    deleted_at_posix,
    deleted_by_user_id
)
SELECT
    CONCAT('flow-pack-item:', gfp.id, '_', fp.ordinality, '_', fp.puzzle_id) AS id,
    gfp.id AS pack_id,
    fp.puzzle_id,
    fp.ordinality AS position,
    gfp.created_at_posix,
    gfp.created_by_user_id,
    gfp.deleted_at_posix,
    gfp.deleted_by_user_id
FROM
    game_flow_pack gfp, LATERAL unnest(gfp.flow_puzzle_ids) WITH ORDINALITY AS fp(puzzle_id, ordinality);


ALTER TABLE game_flow_pack DROP COLUMN flow_puzzle_ids;

-- migrate:down

ALTER TABLE game_flow_pack ADD COLUMN flow_puzzle_ids text[] NOT NULL DEFAULT '{}';

UPDATE game_flow_pack gfp
SET flow_puzzle_ids = sub.aggregated_puzzle_ids
FROM (
    SELECT
        pack_id,
        ARRAY_AGG(puzzle_id ORDER BY position) AS aggregated_puzzle_ids
    FROM
        game_flow_pack_item
    GROUP BY
        pack_id
) sub
WHERE gfp.id = sub.pack_id;

DROP INDEX idx_game_flow_pack_item_pack_id_not_deleted;

DROP TABLE game_flow_pack_item;