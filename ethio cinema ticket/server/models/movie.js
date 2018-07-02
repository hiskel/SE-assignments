var mongoose = require('mongoose')
var MAX_RATING = require('../models/constants').MAX_RATING;
var Schema = mongoose.Schema


var movie_schema = new Schema({
    title: {type: String, required: true, index: true},
    imageURL: {type: String, required: true},
    duration: {type: String, required: true},
    rating: {
        value: {type: Number, default: 0, max: MAX_RATING},
        raters_num: {type: Number, default: 0}
    },
    genre: {type: String, required: true},
    director: {type: String, required: true},
    cast: {type: [String], required: true},
    synopsis: {type: String, required: true},
    scheduled_at: [{
        cinema_id: {type: Schema.Types.ObjectId, required: true, ref: 'Cinema'},
        schedule_id: {type: Schema.Types.ObjectId, required: true},
    }]
}, {usePushEach: true});

module.exports = mongoose.model('Movie', movie_schema);