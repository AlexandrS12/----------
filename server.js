var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var registrationHandler = require('./js/registrationHandler');
var loginHandler = require('./js/loginHandler');
var mssql = require('mssql'); // Подключаем модуль mssql
var pool = require('./js/config'); // Подключение к базе данных

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages'));
app.use(express.static(path.join(__dirname, 'pages/css')));

// Главная страница
app.get('/', function(req, res) {
    res.render('index');
});

// Регистрация
app.get('/register', registrationHandler.loadRegisterPage);
app.post('/register', registrationHandler.registerUser);

// Авторизация
app.get('/login', loginHandler.loadLoginPage);
app.post('/login', loginHandler.loginUser);

// Путь для отображения списка пользователей (для администраторов)
app.get('/users', function(req, res) {
    var request = new mssql.Request(pool);
    request.query('SELECT * FROM Users', function(err, result) {
        if (err) {
            console.log(err);
            return res.send('Ошибка при получении списка пользователей.');
        }
        res.render('users', { users: result.recordset }); // Отображаем пользователей
    });
});

// Путь для редактирования пользователя (GET запрос для отображения формы редактирования)
app.get('/edit/:id', function(req, res) {
    var userId = req.params.id;

    var request = new mssql.Request(pool);
    request.query(`SELECT * FROM Users WHERE id = ${userId}`, function(err, result) {
        if (err) {
            console.log(err);
            return res.send('Ошибка при получении данных пользователя.');
        }
        res.render('edit_user', { user: result.recordset[0] }); // Отображаем форму для редактирования
    });
});

// Путь для обновления данных пользователя (POST запрос для сохранения изменений)
app.post('/edit/:id', function(req, res) {
    var userId = req.params.id;
    var name = req.body.name;
    var login = req.body.login;

    var request = new mssql.Request(pool);
    request.query(`UPDATE Users SET Name = '${name}', Login = '${login}' WHERE id = ${userId}`, function(err) {
        if (err) {
            console.log(err);
            return res.send('Ошибка при обновлении данных пользователя.');
        }
        res.redirect('/users'); // Перенаправляем обратно на страницу пользователей
    });
});

// Путь для удаления пользователя
app.post('/delete/:id', function(req, res) {
    var userId = req.params.id;

    var request = new mssql.Request(pool);
    request.query(`DELETE FROM Users WHERE id = ${userId}`, function(err) {
        if (err) {
            console.log(err);
            return res.send('Ошибка при удалении пользователя.');
        }
        res.redirect('/users'); // Перенаправляем обратно на страницу пользователей
    });
});

// Запуск сервера
app.listen(8080, function() {
    console.log('Server is running on port 8080');
});
