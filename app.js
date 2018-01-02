const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const loggerm = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('config');
const diContainer = require('./src/diContainer')();
const midw = require('./src/token_middleware');

diContainer.register('authdb_path', process.env.NODE_AUTHDB_PATH ? process.env.NODE_AUTHDB_PATH : config.Databases.authDB);
diContainer.register('trusteddb_path', process.env.NODE_TRUSTEDDB_PATH ? process.env.NODE_TRUSTEDDB_PATH : config.Databases.trustedDB);
diContainer.register('configdb_path', config.Databases.configDB);
diContainer.register('refresh_tokendb_path', config.Databases.refreshTokenDB);
diContainer.register('access_tokendb_path', config.Databases.accessTokenDB);
diContainer.register('logging_path', config.ServerInfo.loggingPath);
diContainer.register('logging_level', config.ServerInfo.loggingLevel);
diContainer.register('log_name', config.ServerInfo.logName);
diContainer.register('audit', config.Controls.Audit);
diContainer.register('password', config.Controls.Password);
diContainer.register('jwt_config', config.JWT);
diContainer.register('trust', config.APIKey);
diContainer.factory('logger', require('./src/logging'));
diContainer.factory('utils', require('./src/utils'));
diContainer.factory('databases', require('./src/databases'));
diContainer.factory('token_db_access', require('./src/tokenDBAccess'));
diContainer.factory('user_db_access', require('./src/userDBAccess'));
diContainer.factory('trusted_db_access', require('./src/trustedDBAccess'));
diContainer.factory('pass_complexity', require('./src/passComplexity'));
diContainer.factory('hash_pass', require('./src/hashpass'));
diContainer.factory('auth_validation', require('./src/authValidation'));
diContainer.factory('access_utils', require('./src/accessUtils'));
diContainer.factory('init_route', require('./routes/initialize'));
diContainer.factory('auth_route', require('./routes/auth'));
diContainer.factory('batch_route', require('./routes/batchinsert'));
diContainer.factory('users_route', require('./routes/users'));
diContainer.factory('trusts_route', require('./routes/trusts'));
const index = require('./routes/index');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(loggerm('dev'));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(midw({secret: diContainer.get('jwt_config').secret, exclude: ['/api/auth', '/api/init'], apiKeyReq: diContainer.get('trust').required }, diContainer.get('access_utils'), diContainer.get('logger')));

app.use('/api', index);
app.use('/api/init', diContainer.get('init_route'));
app.use('/api/auth', diContainer.get('auth_route'));
app.use('/api/batch', diContainer.get('batch_route'));
app.use('/api/users', diContainer.get('users_route'));
app.use('/api/trusts', diContainer.get('trusts_route'));
app.use('/api/testing', require('./routes/testing')());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
