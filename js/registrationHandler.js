var mssql = require('mssql');
var pool = require('./config');

module.exports = {
    loadRegisterPage: function(req, res) {
        res.render('register', { message: null });
    },

    registerUser: function(req, res) {
        var name = req.body.name;
        var login = req.body.login;
        var password = req.body.password;

        if (!name || !login || !password) {
            return res.render('register', { message: 'All fields must be filled.' });
        }

        var transaction = new mssql.Transaction(pool);

        transaction.begin(err => {
            if (err) {
                console.log(err);
                return res.render('register', { message: 'Error initializing transaction.' });
            }

            var request = new mssql.Request(transaction);
            request.query(`SELECT * FROM Users WHERE Login = '${login}'`, function(err, result) {
                if (err) {
                    transaction.rollback(() => {
                        console.log('Error in SELECT query, rolling back transaction');
                        res.render('register', { message: 'Error checking login.' });
                    });
                } else if (result.recordset.length > 0) {
                    transaction.rollback(() => {
                        res.render('register', { message: "This login already exists, please choose another one." });
                    });
                } else {
                    var insertQuery = `INSERT INTO Users (Name, Login, Password) VALUES ('${name}', '${login}', '${password}')`;
                    request.query(insertQuery, function(err) {
                        if (err) {
                            console.log('SQL Error:', err);
                            transaction.rollback(() => {
                                res.render('register', { message: 'Error registering user.' });
                            });
                        } else {
                            transaction.commit(err => {
                                if (err) {
                                    console.log('Error committing transaction');
                                    res.render('register', { message: 'Error finalizing transaction.' });
                                } else {
                                    res.redirect('/');
                                }
                            });
                        }
                    });
                }
            });
        });
    }
};
