var mssql = require('mssql');
var pool = require('./config');

module.exports = {
    loadLoginPage: function(req, res) {
        res.render('login', { message: null });
    },

    loginUser: function(req, res) {
        var login = req.body.login;
        var password = req.body.password;

        var transaction = new mssql.Transaction(pool);

        transaction.begin(err => {
            if (err) {
                console.log(err);
                return res.send('Error initializing transaction');
            }

            var request = new mssql.Request(transaction);
            
            request.query(`SELECT * FROM Admins WHERE Login = '${login}'`, function(err, result) {
                if (err) {
                    transaction.rollback(() => {
                        console.log('Error during SELECT query, rolling back transaction');
                        res.render('login', { message: 'Authorization error' });
                    });
                } else if (result.recordset.length > 0) {
                    var admin = result.recordset[0];
                    if (admin.Password === password) {
                        request.query(`SELECT * FROM Users`, function(err, users) {
                            if (err) {
                                transaction.rollback(() => {
                                    console.log('Error retrieving all users, rolling back transaction');
                                    res.render('login', { message: 'Error loading user list' });
                                });
                            } else {
                                transaction.commit(err => {
                                    if (err) {
                                        console.log('Error committing transaction');
                                        res.render('login', { message: 'Error finalizing transaction' });
                                    } else {
                                        res.render('users', { users: users.recordset });
                                    }
                                });
                            }
                        });
                    } else {
                        transaction.rollback(() => {
                            res.render('login', { message: 'Incorrect password. Please enter the correct password.' });
                        });
                    }
                } else {
                    transaction.rollback(() => {
                        res.render('login', { message: "Administrator does not exist. Please contact the site administrator. Contacts: +380971234567" });
                    });
                }
            });
        });
    }
};
