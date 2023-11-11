CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER,
    name TEXT NOT NULL,
    FOREIGN KEY(parent_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Wildlife (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Fields (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS FieldValues (
    wildlife_id INTEGER NOT NULL,
    field_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY(wildlife_id) REFERENCES Wildlife(id),
    FOREIGN KEY(field_id) REFERENCES Fields(id)
    PRIMARY KEY (wildlife_id, field_id)
);