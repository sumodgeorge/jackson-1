const type = process.env.DB_TYPE || 'postgres';

module.exports = {
  type,
  url: process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  synchronize: false,
  logging: true,
  entities: ['src/db/sql/entity/**/*.js'],
  migrations: [`migration/${type}/**/*.js`],
  cli: {
    entitiesDir: 'src/db/sql/entity',
    migrationsDir: `migration/${type}`,
  },
};
