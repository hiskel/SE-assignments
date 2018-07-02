var jwt = require('jsonwebtoken');
var salt_string = require('../models/secrets').salt_string;
var Admin = require('../models/admin');
var User = require('../models/user');

var sendErrorMsg = require('../routes/route_helper').sendErrorMsg;
var sendSuccess = require('../routes/route_helper').sendSuccess;

module.exports = {
    authenticateUser: function (req, res, next) { 
        var token = req.headers['token'];
        if (token && token.trim()) {
            jwt.verify(token, salt_string, (err, decoded) => {
                if (err) sendErrorMsg(res, err);
                else {
                    const user_name = decoded.user_name;
                    User.findOne({user_name: user_name}, (err, user) => {
                        if (err) sendErrorMsg(res, err);
                        else if (!user) sendErrorMsg(res, 'account doesnt exist');
                        else {
                            req.user_info = user;
                            next();
                        }
                    });
                }
            });
        }
        else {
            sendErrorMsg(res, 'missing token!');
        }
    },
    authenticateAdmin: function (req, res, next) { 
        var token = req.headers['token'];
        if (token && token.trim()) {
            jwt.verify(token, salt_string, (err, decoded) => {
                if (err) sendErrorMsg(res, err);
                else {
                    const user_name = decoded.user_name;
                    Admin.findOne({user_name: user_name}, (err, user) => {
                        if (err) sendErrorMsg(res, err);
                        else if (!user) sendErrorMsg(res, 'account doesnt exist');
                        else {
                            req.user_info = user;
                            next();
                        }
                    });
                }
            });
        }
        else {
            sendErrorMsg(res, 'missing token!');
        }
    }
}