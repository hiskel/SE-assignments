var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;


var admin_schema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    imageURL: {type: String, default: 'default_user.jpg'},
    phone: {type: String, required: true, unique: true},
    user_name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
});

admin_schema.methods.isPasswordValid = function (password) {
    return bcrypt.compareSync(password, this.password)
} 

module.exports = mongoose.model('Admin', admin_schema);