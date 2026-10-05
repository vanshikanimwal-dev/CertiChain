-- Baseline for later domain tables.
-- Records stored by this prototype are synthetic Demo University data.

CREATE TABLE schema_info (
    id integer PRIMARY KEY,
    note text NOT NULL
);

INSERT INTO schema_info (id, note)
VALUES (1, 'Synthetic Demo University data only. Not real academic credentials.');
