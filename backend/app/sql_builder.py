import re
from app.constants import FIELD_TYPE_MAP


def get_table_name(app_id: str, table_name: str) -> str:
    safe_table = re.sub(r"[^a-z0-9_]", "", table_name, flags=re.IGNORECASE)
    safe_id    = re.sub(r"[^a-z0-9]",  "", app_id,     flags=re.IGNORECASE)
    return f"app_{safe_id}_{safe_table}"


def build_create_table_sql(app_id: str, table_name: str, fields: list[dict]) -> str:
    tbl = get_table_name(app_id, table_name)
    col_defs = []
    for f in fields:
        col  = re.sub(r"[^a-z0-9_]", "", f["name"], flags=re.IGNORECASE)
        pg   = FIELD_TYPE_MAP.get(f.get("type", "text"), "TEXT")
        null = "NOT NULL" if f.get("required") else ""
        col_defs.append(f'  "{col}" {pg} {null}'.strip())
    cols = ",\n      ".join(col_defs)
    return f"""
    CREATE TABLE IF NOT EXISTS "{tbl}" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      {cols},
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
    """


def build_alter_add_column_sql(app_id: str, table_name: str, field: dict) -> str:
    tbl = get_table_name(app_id, table_name)
    col = re.sub(r"[^a-z0-9_]", "", field["name"], flags=re.IGNORECASE)
    pg  = FIELD_TYPE_MAP.get(field.get("type", "text"), "TEXT")
    return f'ALTER TABLE "{tbl}" ADD COLUMN IF NOT EXISTS "{col}" {pg}'


def build_drop_table_sql(app_id: str, table_name: str) -> str:
    tbl = get_table_name(app_id, table_name)
    return f'DROP TABLE IF EXISTS "{tbl}"'


def build_count_sql(app_id: str, table_name: str) -> str:
    tbl = get_table_name(app_id, table_name)
    return f'SELECT COUNT(*) FROM "{tbl}"'
