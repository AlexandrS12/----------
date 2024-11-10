var mssql = require('mssql');

var config = {
    server: 'Alex\\SQLEXPRESS',
    database: 'dbusers',
    user: 'admin',
    password: 'admin',
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: 1433
};

var pool = new mssql.ConnectionPool(config);
pool.connect(err => {
    if (err) console.log(err);
    else console.log("Connected to the database");
});

module.exports = pool;