var mongoose = require('mongoose');
var MAX_SEATS = require('../models/constants').MAX_SEAT_NUM;
var MIN_SHOW_TIME = require('../models/constants').MIN_SHOW_TIME;
var MAX_SHOW_TIME = require('../models/constants').MAX_SHOW_TIME;
var Schema = mongoose.Schema

var schedule_schema = {
    date: {type: Date, require: true}, // monday, tuesday ...
    movie_id: {type: Schema.Types.ObjectId, required: true, ref: 'Movie'},
    time: {type: Number, require: true, min: MIN_SHOW_TIME, max: MAX_SHOW_TIME},
    seats_reserved: {type: Number, default: 0},
    price: {type: Number, require: true},
    bookings: [{
        user_id: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        seats_reserved: {type: Number, max: MAX_SEATS},
        unique_id: {type: String, required: true}
    }],
    still_on: {type: Boolean, default: true}
}

var cinema_schema = new Schema({
    name: {type: String, required: true, unique: true},
    balance: {type: Number, default: 0},
    seats: {type: Number, required: true},
    imageURL: {type: String, required: true},
    address: {type: String, required: true},
    schedules: [schedule_schema]
}, {usePushEach: true});

cinema_schema.methods.areThereEnoughSeats = function (schedule_id, num_of_seats) {  
    return (this.seats - this.schedules.id(schedule_id).seats_reserved) >= num_of_seats;
}

module.exports = mongoose.model('Cinema', cinema_schema);