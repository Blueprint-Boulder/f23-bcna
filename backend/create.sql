CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER,
    name TEXT NOT NULL UNIQUE,
    FOREIGN KEY (parent_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Wildlife (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE,
    scientific_name TEXT NOT NULL UNIQUE,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Images (
    filename TEXT PRIMARY KEY,
    wildlife_id INTEGER NOT NULL,
    alt_text TEXT,
    caption TEXT
);

CREATE TABLE IF NOT EXISTS Fields (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL CHECK (type in ('TEXT', 'INTEGER', 'ENUM')),
    name TEXT NOT NULL UNIQUE CHECK (name not in ('name', 'scientific_name'))
);

CREATE TABLE IF NOT EXISTS FieldsToCategories (
    field_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (field_id) REFERENCES Fields(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    PRIMARY KEY (field_id, category_id)
);

CREATE TABLE IF NOT EXISTS FieldValues (
    wildlife_id INTEGER NOT NULL,
    field_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (wildlife_id) REFERENCES Wildlife(id),
    FOREIGN KEY (field_id) REFERENCES Fields(id),
    PRIMARY KEY (wildlife_id, field_id)
);

CREATE TABLE IF NOT EXISTS EnumeratedOptions (
    id INTEGER PRIMARY KEY,
    field_id INTEGER NOT NULL,
    option_value TEXT NOT NULL,
    FOREIGN KEY (field_id) REFERENCES Fields(id),
    UNIQUE (field_id, option_value)
);

CREATE TABLE IF NOT EXISTS EnumeratedFieldValues (
    wildlife_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    FOREIGN KEY (wildlife_id) REFERENCES Wildlife(id),
    FOREIGN KEY (option_id) REFERENCES CategoricalOptions(id),
    PRIMARY KEY (wildlife_id, option_id)
);
