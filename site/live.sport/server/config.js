import dotenv from 'dotenv';
dotenv.config({ path: new URL('./.env', import.meta.url) });

// ---------------------------------------------------------------------- //

const config = {};

config.redis = {
	basic: null,
	sentinel: null,
	master: null,
};

if (process.env.REDIS_URL) {
	let redisUrl = new URL(process.env.REDIS_URL);

	config.redis.basic = {
		host: redisUrl.hostname,
		port: Number(redisUrl.port),
		password: redisUrl.password,
		databaseIndex: Number(redisUrl.pathname.slice(1)),
	};
}

if (
	process.env.REDIS_SENTINEL_HOSTS &&
	process.env.REDIS_SENTINEL_PORT &&
	process.env.REDIS_MASTER_NAME
) {
	config.redis.sentinel = {
		hosts: process.env.REDIS_SENTINEL_HOSTS.split(','),
		port: Number(process.env.REDIS_SENTINEL_PORT),
		password: process.env.REDIS_SENTINEL_PASSWORD,
	};

	config.redis.master = {
		name: process.env.REDIS_MASTER_NAME,
		password: process.env.REDIS_MASTER_PASSWORD,
	};
}


config.database = {
	pool: {
		min: Number(process.env.DATABASE_POOL_MIN),
		max: Number(process.env.DATABASE_POOL_MAX),
	},
	url: process.env.DATABASE_URL,
	schema: process.env.DATABASE_SCHEMA || 'public',
};

export default config;
