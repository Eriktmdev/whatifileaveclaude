// Las pruebas usan una base de datos propia para no tocar tus datos locales.
// Define TEST_DATABASE_URL o se usará la base whatifileave_test local.
import 'dotenv/config'

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://wil:wil@localhost:5432/whatifileave_test'
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-secret'
