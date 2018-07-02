var router = require('express').Router();
var Movie = require('../models/movie');
var authenticateAdmin = require('../routes/authentication_helper').authenticateAdmin;

var sendErrorMsg = require('../routes/route_helper').sendErrorMsg;
var sendSuccess = require('../routes/route_helper').sendSuccess;

router.get('/all_movies', (req, res, next) => {
    Movie
        .find({})
        .select('-__v -director -cast -synopsis -scheduled_at -rating.raters_num')
        .exec((err, result) => {
            if (err) sendErrorMsg(res, 'something went wrong in /all_movies');
            else sendSuccess(res, result);
    });
});

router.get('/a_movie/:movie_id', (req, res, next) => {
    const movie_id = req.params['movie_id'];
    Movie
        .findById(movie_id)
        .populate({
            path: 'scheduled_at.cinema_id',
            select: '_id name schedules seats',
        })
        .select('-rating.raters_num -__v')
        .exec((err, movie) => {
            if (err) sendErrorMsg(res, err.message);
            else if (!movie) sendErrorMsg(res, 'no movies foudn by that id:: in /a_movie:movie_id');
            else {
                const schedules = [];
                // extract from the cinama, this movie's schedules!
                movie.scheduled_at.forEach(debut => {
                    const schedule_id = debut.schedule_id;
                    const movie_schedule = debut.cinema_id.schedules.id(schedule_id);
                    if (movie_schedule.still_on) {
                        const per_cinema_schedule = {
                            cinema_name: debut.cinema_id.name,
                            cinema_id: debut.cinema_id._id,
                            seats: debut.cinema_id.seats,
                            movie_schedule: {
                                schedule_id: schedule_id,
                                date: movie_schedule.date,
                                time: movie_schedule.time,
                                price: movie_schedule.price,
                                still_on: movie_schedule.still_on,
                                seats_reserved: movie_schedule.seats_reserved
                            }
                        };
                        schedules.push(per_cinema_schedule);
                    }
                });
                
                const full_info = {
                    director: movie.director,
                    cast: movie.cast,
                    sysnopsis: movie.synopsis,
                    schedules: schedules,
                }
                sendSuccess(res, full_info);
            }
        });
});

router.use(authenticateAdmin);
router.post('/add_movie', (req, res) => {
    const schema = {
        title: 'eyemetash tegni',
        imageURL: 'eyemetash_tegni.jpg',
        duration: '102 min',
        genre: 'comedy, drama',
        director: 'Hiskel Kelemework',
        cast: ['Dawit Gizaw', 'Zerihun Tesfaye', 'Fasil Kelemework'],
        synopsis: 'a poor rich man decides to become the wealthiest poor person on earth',
    };

    var title = req.body['title'];
    var imageURL = req.body['imageURL'];
    var duration = req.body['duration'];
    var genre = req.body['genre'];
    var director = req.body['director'];
    var cast = req.body['cast'];
    var synopsis = req.body['synopsis']

    if (title && title.trim() && imageURL && imageURL.trim() && duration && duration.trim() && 
        genre && genre.trim() && director && director.trim() && Array.isArray(cast) && cast.length > 0
        && synopsis && synopsis.trim())  {
        const movie = new Movie({
            title: title.trim(),
            imageURL: imageURL.trim(),
            duration: duration.trim(),
            genre: genre.trim(),
            director: director.trim(),
            cast: cast,
            synopsis: synopsis.trim()
        });
        movie.save((err, saved) => {
            if (err) sendErrorMsg(res, err);
            else sendSuccess(res, {
                id: saved._id,
                name: saved.title,
                imageURL: saved.imageURL,
            });
        });       
    } else {
        sendErrorMsg(res, `title, imageURL, duration, genre, director, cast 
                            and sysnopsis must all be valid and present!`);
    }

});

module.exports = router;
