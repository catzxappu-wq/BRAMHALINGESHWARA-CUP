const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

if (isPostgres) {
  console.log('🔄 Detected PostgreSQL/Supabase database URL. Configuring Prisma schema for PostgreSQL...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  if (process.env.DIRECT_URL && !schema.includes('directUrl')) {
    schema = schema.replace(
      'url      = env("DATABASE_URL")',
      'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
    );
  }
} else {
  console.log('📁 Using SQLite database schema (local/dev mode).');
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  schema = schema.replace(/\n\s*directUrl\s*=\s*env\("DIRECT_URL"\)/g, '');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ Prisma schema prepared successfully.');
