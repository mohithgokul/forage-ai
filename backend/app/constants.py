FIELD_TYPE_MAP = {
    "text":     "TEXT",
    "textarea": "TEXT",
    "number":   "NUMERIC",
    "email":    "VARCHAR(255)",
    "date":     "DATE",
    "select":   "VARCHAR(100)",
    "checkbox": "BOOLEAN DEFAULT FALSE",
    "url":      "TEXT",
}

VALID_FIELD_TYPES = list(FIELD_TYPE_MAP.keys())
VALID_TRIGGERS = ["on_create", "on_update", "on_delete"]
VALID_ACTIONS  = ["log_event", "send_email", "webhook"]

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS   = 7

MAX_TABLES        = 8
MAX_FIELDS        = 15
MAX_PROMPT_LENGTH = 1000
CSV_MAX_SIZE_MB   = 10
BATCH_INSERT_SIZE = 500
