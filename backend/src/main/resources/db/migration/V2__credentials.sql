CREATE TABLE users (
    id uuid PRIMARY KEY,
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    full_name varchar(255) NOT NULL,
    role varchar(64) NOT NULL
);

CREATE TABLE students (
    id varchar(64) PRIMARY KEY,
    name varchar(255) NOT NULL,
    student_number varchar(64) NOT NULL UNIQUE,
    department varchar(255) NOT NULL,
    course varchar(255) NOT NULL,
    graduation_year integer NOT NULL
);

CREATE TABLE certificates (
    id varchar(64) PRIMARY KEY,
    student_id varchar(64) NOT NULL REFERENCES students (id),
    certificate_type varchar(64) NOT NULL,
    degree varchar(255) NOT NULL,
    department varchar(255) NOT NULL,
    issue_date date NOT NULL,
    grade varchar(32) NOT NULL,
    status varchar(32) NOT NULL,
    document_hash varchar(64) NOT NULL DEFAULT '',
    revoked_reason text NOT NULL DEFAULT '',
    chain_status varchar(32) NOT NULL,
    chain_tx_hash varchar(128) NOT NULL DEFAULT ''
);

CREATE TABLE verification_logs (
    id uuid PRIMARY KEY,
    certificate_id varchar(64) NOT NULL,
    result varchar(32) NOT NULL,
    verification_type varchar(32) NOT NULL,
    verified_at timestamptz NOT NULL
);
