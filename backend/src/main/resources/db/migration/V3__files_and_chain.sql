ALTER TABLE certificates
    ADD COLUMN file_hash varchar(64) NOT NULL DEFAULT '',
    ADD COLUMN file_key varchar(255) NOT NULL DEFAULT '',
    ADD COLUMN chain_network varchar(32) NOT NULL DEFAULT '';

CREATE TABLE chain_deployment (
    id integer PRIMARY KEY,
    contract_address varchar(66) NOT NULL,
    chain_id bigint NOT NULL
);
