var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var salt_string = require('../models/secrets').salt_string;
var multiplicand = require('../models/secrets').multiplicand;
var MAX_SEATS = require('../models/constants').MAX_SEAT_NUM;
var MAX_RATING = require('../models/constants').MAX_RATING;

var router = require('express').Router();
var User = require('../models/user');
var Cinema = require('../models/cinema');
var Voucher = require('../models/voucher');
var Movie = require('../models/movie');

var sendErrorMsg = require('../routes/route_helper').sendErrorMsg;
var sendSuccess = require('../routes/route_helper').sendSuccess;
var authenticateUser = require('../routes/authentication_helper').authenticateUser;

router.get('/token/', (req, res) => {
    res.json({token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJtdWNoYWNob3MiLCJpYXQiOjE1Mjk2NDYwNjZ9.Z6wmlF_STnbkdhENl-ib-RJZo71gTmVeQNbb1WEpHGc"})
})

router.post('/login', (req, res) => {
    var user_name = req.body['user_name'];
    var password = req.body['password'];
    if (user_name && password && user_name.trim() && password.trim()) {
        User
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
                        balance: user.balance,
                    };
                    sendSuccess(res, user_info);
                }
            });
    } else {
        sendErrorMsg(res, 'username and/or password can not be empty!');
    }
}); 

router.post('/signup', (req, res) => {
    var first_name = req.body['first_name'];
    var last_name = req.body['last_name'];
    var user_name = req.body['user_name'];
    var password = req.body['password'];
    var phone = req.body['phone'];

    if (first_name && first_name.trim() && last_name && last_name.trim() &&
        user_name && user_name.trim() && password && password.trim() && phone && phone.trim()) {
        User.findOne({user_name: user_name.trim()}, (err, user) => {
            if (err) sendErrorMsg(res, err);
            else if (user) sendErrorMsg(res, 'username already exists!');
            else {                
                // good to go!
                const new_user = new User({
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    user_name: user_name.trim(),
                    phone: phone.trim(),
                    password: bcrypt.hashSync(password)
                });
                new_user.save((err) => {
                    if (err) sendErrorMsg(res, err);
                    else sendSuccess(res, {
                        token: jwt.sign({user_name: user_name.trim()}, salt_string),
                        first_name: first_name.trim(),
                        last_name: last_name.trim(),
                        user_name: user_name.trim(),
                        phone: phone.trim()
                    });
                });
            }
        });
    }else {
        sendErrorMsg(res, 'first_name, last_name, user_name, phone, password can not be empty!');
    }
});

//----------------------- PROTECTED AREA ------------------------------------
router.use(authenticateUser);

router.post('/recharge', (req, res) => {
    var card_number = parseInt(req.body['card_number']);
    if (!isNaN(card_number)) {
        Voucher.findOne({number: card_number}, (err, voucher) => {
            if (err) sendErrorMsg(res, err);
            else if (!voucher) sendErrorMsg(res, 'invalid voucher card number!');
            else if (voucher.isUsed()) sendErrorMsg(res, 'warning! voucher already used!');
            else {
                req.user_info.balance += voucher.value;
                req.user_info.save((err) => {
                    if (err) sendErrorMsg(res, err);
                    else {
                        voucher.invalidate();
                        voucher.save((err) => {
                            if (err) sendErrorMsg(res, err);
                            else sendSuccess(res, {balance: req.user_info.balance});
                        });
                    }
                });
            }
        });
    } else {
        sendErrorMsg(res, 'card number must be a number and non-empty!');
    }
});

router.get('/account_info', (req, res) => {
    User
        .findById(req.user_info._id)
        .select('user_name phone balance booked_tickets')
        .populate({
            path: 'booked_tickets.cinema_id', 
            select: 'name _id schedules.date schedules._id schedules.time'
        })
        .populate({path: 'booked_tickets.movie_id', select: 'title _id'})
        .exec((err, user) => {
           if (err) sendErrorMsg(res, err); 
           else if (!user) sendErrorMsg(res, 'user not found!');
           else {
                const schedules = [];
                user.booked_tickets.forEach(booking => {
                    const schedule_id = booking.schedule_id;
                    const movie_schedule = booking.cinema_id.schedules.id(schedule_id);
                    if (movie_schedule) {
                        const single_booking_info = {
                            cinema_id: booking.cinema_id._id,
                            cinema_name: booking.cinema_id.name,
                            movie_id: booking.movie_id._id,
                            movie_title: booking.movie_id.title,
                            date: movie_schedule.date,
                            time: movie_schedule.time,
                            unique_id: booking.unique_id
                        };
                        schedules.push(single_booking_info);  
                    }
                    
                });

                const to_return = {
                   user_name: user.user_name,
                   phone: user.phone,
                   balance: user.balance,
                   booked_tickets: schedules
                }
                sendSuccess(res, to_return);
            }
        });
        
});

router.post('/book', (req, res) => {
    var cinema_id = req.body['cinema_id'];
    var schedule_id = req.body['schedule_id'];
    var num_of_seats =  parseInt(req.body['num_of_seats']);

    if (cinema_id && cinema_id.trim() && schedule_id && schedule_id.trim() && !isNaN(num_of_seats)) {        
        Cinema.findById(cinema_id, (err, cinema) => {
            if (err) sendErrorMsg(res, err);
            else if (!cinema) sendErrorMsg(res, 'invalid cinema id!');
            else if (num_of_seats <= 0 || num_of_seats > MAX_SEATS) {
                    sendErrorMsg(res, `must specify seats value between 1 and ${MAX_SEATS} !`);    
            }else {
                const schedule = cinema.schedules.id(schedule_id);
                if (schedule) {
                    if (cinema.areThereEnoughSeats(schedule_id, num_of_seats)) {
                        const total_payment = schedule.price * num_of_seats;
                        if (req.user_info.hasSufficientBalance(total_payment)) {
                            const unique_booking_id = Math.floor(Date.now() / (Math.random() * multiplicand));
                            const booking_info_for_cinema = {
                                user_id: req.user_info._id,
                                seats_reserved: num_of_seats,
                                unique_id: unique_booking_id
                            };
                            const booking_info_for_user = {
                                cinema_id: cinema._id,
                                movie_id: schedule.movie_id,
                                num_of_seats: num_of_seats,
                                unique_id: unique_booking_id,
                                schedule_id: schedule._id,
                                new_balance: req.user_info.balance - total_payment
                            }
                            req.user_info.balance -= total_payment;
                            cinema.balance += total_payment;                            
                            req.user_info.booked_tickets.push(booking_info_for_user);
                            cinema.schedules.id(schedule_id).bookings.push(booking_info_for_cinema);
                            req.user_info.save((err) => {
                                if (err) sendErrorMsg(res, err);
                                else {
                                    cinema.save((err) => {
                                        if (err) sendErrorMsg(res, err);
                                        else sendSuccess(res, booking_info_for_user);
                                    })
                                }
                            })
                        }else {
                            sendErrorMsg(res, 'insuffiecient balance!');
                        }
                    }else {
                        sendErrorMsg(res, 'there aren\'t enough seats!');
                    }
                }else {
                    sendErrorMsg(res, 'invalid schedule id sent!');
                }
            }
        });
    }else {
        sendErrorMsg(res, 'cinema_id, schedule_id, num_of_seats all have to be valid and not empty!');
    }
});

router.post('/rate', (req, res) => {
    var movie_id = req.body['movie_id'];
    var rating = parseFloat(req.body['rating']);

    if (movie_id && movie_id.trim() && !isNaN(rating)) {
        if (rating < 0 || rating > MAX_RATING) {
            sendErrorMsg(res, `rating must be between 0 and ${MAX_RATING}`)
        } else {
            Movie.findById(movie_id.trim(), (err, movie) => {
                if (err) sendErrorMsg(res, err);
                else if (!movie) sendErrorMsg(res, 'invalid movie id!');
                else {
                    const current_rating = movie.rating.value;
                    const num_of_raters = movie.rating.raters_num;
                    const new_rating = (current_rating * num_of_raters + rating) / (num_of_raters + 1);
                    const new_num_of_raters = num_of_raters + 1;
                    movie.rating.value = new_rating;
                    movie.rating.raters_num = new_num_of_raters;
                    movie.save((err) => {
                        if (err) sendErrorMsg(res, err);
                        else sendSuccess(res, movie.rating.value);
                    });
                }
            });
        }
    } else {
        sendErrorMsg(res, 'both movie_id and rating should be present and be valid!');
    }
});

module.exports = router;