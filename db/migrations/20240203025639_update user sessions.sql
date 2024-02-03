-- migrate:up

ALTER TABLE user_sessions ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE;


-- migrate:down

ALTER TABLE user_sessions DROP COLUMN ended_at;
```

