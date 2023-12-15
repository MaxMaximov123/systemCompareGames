import Redis from 'ioredis';
import config from './config.js';

// ----------------------------------------------------------------------
function createRedis() {
	if (config.redis.basic) {
		return new Redis({
			host: config.redis.basic.host,
			port: config.redis.basic.port,
			password: config.redis.basic.password,
			db: config.redis.basic.databaseIndex,
			enableOfflineQueue: false,
			maxRetriesPerRequest: 1,
		});
	}

	if (config.redis.sentinel) {
		return new Redis({
			sentinels: config.redis.sentinel.hosts.map((sentinelHost) => {
				return {
					host: sentinelHost,
					port: config.redis.sentinel.port,
				};
			}),
			sentinelPassword: config.redis.sentinel.password,
			name: config.redis.master.name,
			password: config.redis.master.password,
		});
	}

	return null;
}

let redis = createRedis();


// ----------------------------------------------------------------------

export default redis;