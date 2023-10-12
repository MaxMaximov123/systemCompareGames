import config from './config.js';

export default {
    client: 'pg',
	connection: config.database.url,
	searchPath: [config.database.schema],

	pool: {
		afterCreate(connection, done) {
			connection.query('SET timezone="UTC";', (error) => {
				done(error, connection);
			});
		},
		min: config.database.pool.min,
		max: config.database.pool.max,
	},

	useNullAsDefault: true,
};
