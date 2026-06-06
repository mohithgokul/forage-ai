CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(15), 'hex'),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  "googleId" TEXT UNIQUE,
  avatar TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(15), 'hex'),
  token TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "App" (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(15), 'hex'),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  status TEXT DEFAULT 'BUILDING',
  "errorMessage" TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Automation" (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(15), 'hex'),
  "appId" TEXT NOT NULL REFERENCES "App"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  "tableName" TEXT NOT NULL,
  action TEXT NOT NULL,
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ActivityLog" (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(15), 'hex'),
  "appId" TEXT NOT NULL REFERENCES "App"(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  "tableName" TEXT NOT NULL,
  "recordId" TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
