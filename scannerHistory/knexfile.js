require('dotenv').config();

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB
        },
        migrations: {
            directory: './migrations'
        },
        
        pool: { min: 10, max: 30 }

    }
    };
  