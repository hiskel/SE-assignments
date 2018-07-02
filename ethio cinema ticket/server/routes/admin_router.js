var jwt = require('jsonwebtoken');
var salt_string = require('../models/secrets').salt_string;

var router = require('express').Router();
var Admin = require('../models/admin');

var sendErrorMsg = require('../routes/route_helper').sendErrorMsg;
var sendSuccess = require('../routes/route_helper').sendSuccess;


router.post('/login', (req, res) => {
    var user_name = req.body['user_name'];
    var password = req.body['password'];
    if (user_name && password && user_name.trim() && password.trim()) {
        Admin
            .findOne({user_name: user_name.trim()})
            .exec((err, user) => {
                if (err) sendErrorMsg(res, err);
                else if (!user) sendErrorMsg(res, 'no such account found!'); 
                else if (!user.isPasswordValid(password)) sendErrorMsg(res, 'incorrect password!');
                else {
                    // here generate token and send it along with other needed data
                    const user_info = {
                        token: jwt.sign({user_name: user.user_name}, salt_string),
                        id: user._id, 
                        imageURL: user.imageURL,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        user_name: user.user_name, 
                        phone: user.phone, 
                    };
                    sendSuccess(res, user_info);
                }
            });
    } else {
        sendErrorMsg(res, 'username and/or password can not be empty!');
    }
});

module.exports = router;