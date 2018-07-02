var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var CONST = require('../models/constants');

var Schema = mongoose.Schema;


var user_schema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    imageURL: {type: String, default: 'default_user.jpg'},
    phone: {type: String, required: true, unique: true},
    user_name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    balance: {type: Number, default: 0},
    booked_tickets: [{
        cinema_id: {type: Schema.Types.ObjectId, required: true, ref: 'Cinema'},
        movie_id: {type: Schema.Types.ObjectId, require: true, ref: 'Movie'},        
        schedule_id: {type: Schema.Types.ObjectId, required: true},
        num_of_seats: {type: Number, required: true, max: CONST.MAX_SEAT_NUM},
        unique_id: {type: String, required: true},
    }]
}, {usePushEach: true});

user_schema.methods.isPasswordValid = function (password) {
    return bcrypt.compareSync(password, this.password)
}

user_schema.methods.hasSufficientBalance = function (amount) {
    return this.balance >= amount;
}   

module.exports = mongoose.model('User', user_schema);