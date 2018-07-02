var router = require('express').Router();
var Cinema = require('../models/cinema');
var Movie = require('../models/movie');

var authenticateAdmin = require('../routes/authentication_helper').authenticateAdmin;

var MIN_SHOW_TIME = require('../models/constants').MIN_SHOW_TIME;
var MAX_SHOW_TIME = require('../models/constants').MAX_SHOW_TIME;


var sendErrorMsg = require('../routes/route_helper').sendErrorMsg;
var sendSuccess = require('../routes/route_helper').sendSuccess;

router.get('/all_cinemas', (req, res, next) => {
    Cinema
        .find({})
        .select('_id name imageURL address')
        .exec((err, cinema) => {
            if (err) sendErrorMsg(res, 'something went wrong in /all_cinemas');
            else sendSuccess(res, cinema);
        });
});

router.get('/a_cinema/:cinema_id', (req, res, next) => {
    const cinema_id = req.params['cinema_id'];
    if (cinema_id && cinema_id.trim()) {
        Cinema
        .findById(cinema_id)
        .select('seats schedules')
        .populate({
            path: 'schedules.movie_id',
            select: '_id title'
        }).exec((err, cinema) => {
            if (err) sendErrorMsg(res, err);
            else if (!cinema) sendErrorMsg(res, 'no cinema found by that id');
            else {
                // implement real logic here!!!!!
                const schedules = [];
                cinema.schedules.forEach(debut => {
                    if (debut.still_on) {
                        const single_schedule = {
                            movie_id: debut.movie_id._id,
                            movie_name: debut.movie_id.title,
                            schedule_id: debut._id,
                            date: debut.date,
                            time: debut.time,
                            price: debut.price
                        };
                        schedules.push(single_schedule);
                    }
                });

                const full_info = {
                    seats: cinema.seats,
                    schedules: schedules
                }
                sendSuccess(res, full_info);
            }
        });
    } else {
        sendErrorMsg(res, 'cinema id is required!');
    }
});

// ---------------------------- PROTECTED --------------------------
router.use(authenticateAdmin);

router.post('/add_cinema', (req, res) => {
    var name = req.body['name'];
    var seats = parseInt(req.body['seats']);
    var imageURL = req.body['imageURL'];
    var address = req.body['address'];

    if (!isNaN(seats) && name && name.trim() && imageURL && imageURL.trim() &&
        address && address.trim() ) {
        const cinema = new Cinema({
            name: name.trim(),
            seats: seats,
            imageURL: imageURL.trim(),
            address: address.trim()
        });
        cinema.save((err, saved) => {
            if (err) sendErrorMsg(res, err);
            else sendSuccess(res, {
                id: saved._id,
                name: saved.name,
                imageURL: saved.imageURL,
                seats: saved.seats
            });
        });       
    } else {
        sendErrorMsg(res, 'name, seats imageURL, address must all be valid and present!');
    }

});

router.post('/add_schedule', (req, res, next) => {
    const cinema_id = req.body['cinema_id'];
    const movie_id = req.body['movie_id'];
    const time = parseFloat(req.body['time']);
    const date = req.body['date']
    const price = req.body['price'];

    if (cinema_id && cinema_id.trim() && movie_id && movie_id.trim() &&
        !isNaN(time) && date && date.trim() && price && price.trim()) {
        if (!(time < MIN_SHOW_TIME || time > MAX_SHOW_TIME)) {
            const new_schedule = {
                date: date,
                movie_id: movie_id,
                time: time,
                price: price
            };
    
            Cinema.findById(cinema_id, (err, cinema) => {
                if (err) sendErrorMsg(res, err);
                else if (!cinema) sendErrorMsg(res, 'non existent cinema id');
                else {
                    Movie.findById(movie_id, (err, movie) => {
                        if (err) sendErrorMsg(res, err);
                        else if (!movie) sendErrorMsg(res, 'non existent movie id');
                        else {
                            // now it is safe to add the new schedule
                            cinema.schedules.push(new_schedule);
                            const movie_scheduled_at = {
                                cinema_id: cinema._id,
                                schedule_id: cinema.schedules[cinema.schedules.length - 1]._id
                            }
                            cinema.save((err) => {
                                if (err) sendErrorMsg(res, err);
                                else {
                                    movie.scheduled_at.push(movie_scheduled_at);
                                    movie.save((err) => {
                                        if (err) sendErrorMsg(res, err);
                                        else sendSuccess(res, 'new schedule added successfully!');
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            sendErrorMsg(res, `time must be between ${MIN_SHOW_TIME} and ${MAX_SHOW_TIME}`);            
        }        
    } else {
        sendErrorMsg(res, 'cinema_id, movie_id, time and price have to be valid and non-empty');
    }
});

module.exports = router;