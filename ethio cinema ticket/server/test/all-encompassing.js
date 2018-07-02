let User = require('../models/user');
let Movie = require('../models/movie');
let Cinema = require('../models/cinema');
let Voucher = require('../models/voucher');
var seedVouchers = require('../seed/seeder_helpers').seedVouchers;
var seedCinemas = require('../seed/seeder_helpers').seedCinemas;

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

var user_test_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJtdWNoYWNob3MiLCJpYXQiOjE1Mjk2MDA4OTl9.QWgYKUWPTczUQ9wZRT7jUhGiNBCoA98T6SYHJWzaXyk";
var admin_test_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJkYXdpdGdpemF3IiwiaWF0IjoxNTI5NjAwODcwfQ.5yv7d9mf005H8JFApwuaQ76a6qaf8Ktp0oSMEfy_AA0";
var movie_id = '';                // set when test is running!
var cinema_id = '';               //
var schedule_id = '';             //

const test_set = {
    sign_up_test_set: [
        {// account created for the first time
            first_name: 'henok',
            last_name: 'dejen',
            phone: '123456',
            user_name: 'muchachos', 
            password: 'muchachos', 
        },
        { // user_name already taken
            first_name: 'hiskel',
            last_name: 'kelemework',
            phone: '123456',
            user_name: 'muchachos', 
            password: 'password', 
        },
        {// one or more fields missing
            first_name: 'hiskel',
            last_name: '',
            phone: '123456',
            user_name: 'dawitgizaw', 
            password: '', 
        }
    
    ],
    login_test_set: [
        {user_name: 'muchachos', password: 'muchachos'},    // correct        
        {user_name: 'kkljkljaldkjf', password: 'jlakdjflkdjf'},    // account not found
        {user_name: 'muchachos', password: 'wrongpass'},    // wrong pass
        {user_name: '', password: 'password'},  // one or more fields empty
    ],
    recharge_test_set: [
        {card_number: 1000000000},   // voucher used for the first time
        {card_number: 1000000000},   // can't use voucher again!                                  
        {card_number: null},       // voucher number can't be empty
        {card_number: 1000000000123},   // no such card_number exists
        {card_number: 'kdjffkdjf'},     // card_numbers are NUMBERS! 
    ],
    account_info_test_set: [
        'somerandomtoken',    // nope!
        ''                // token must be sent!
    ],
    booking_test_set: [
        {
            cinema_id: '5b2553b4d6cee42facbf7705', 
            schedule_id: '5b255de61b6bb9249c011fa0', 
            num_of_seats: 6, expected: false     // 0 < num_of_seats <= 5
        }, 
        {
            cinema_id: '5b2553b4d6cee42facbf7705', 
            schedule_id: '5b255de61b6bb9249c011fa0', 
            num_of_seats: -1, expected: false   // 0 < num_of_seats <= 5
        }, 
        {
            cinema_id: '5b2553b4d6cee42facbf7705', 
            schedule_id: '5b255de61b6bb9249c011fa0', 
            num_of_seats: 2, expected: false    // insufficient balance! balance is 25!
        },  
        {
            cinema_id: '5b2553b4d6cee42facbf7705', 
            schedule_id: '5b255de61b6bb9249c011fa0', 
            num_of_seats: 1, expected: true    // sufficient balance and seat numbers in range!
        }, 
        {
            cinema_id: '5b2553b4d6cee42facbf7705', 
            schedule_id: '5b255de61b6bb9249c011fa0', 
            num_of_seats: 1, expected: false    // insufficient balance (25-15 = 10) < 15 b/c paid above!
        }, 
        {cinema_id: '', schedule_id: '', num_of_seats: 3, expected: false}
    ],
    add_movie_test_set: [
        {   // should succeed b/c all info is valid
            title: 'eyemetash tegni',
            imageURL: 'eyemetash_tegni.jpg',
            duration: '102 min',
            genre: 'comedy, drama',
            director: 'Hiskel Kelemework',
            cast: ['Dawit Gizaw', 'Zerihun Tesfaye', 'Fasil Kelemework'],
            synopsis: 'a poor rich man decides to become the wealthiest poor person on earth',
        },
        {   // should fail b/c one or more fields is missing
            title: '',
            imageURL: 'eyemetash_tegni.jpg',
            duration: '102 min',
            genre: 'comedy, drama',
            director: 'Hiskel Kelemework',
            cast: ['Dawit Gizaw', 'Zerihun Tesfaye', 'Fasil Kelemework'],
            synopsis: 'a poor rich man decides to become the wealthiest poor person on earth',
        },
    ],
    add_cinema_test_set: [
        {   // should succeed
            name: 'cinema Empire',
            seats: 20,
            imageURL: 'cinema_empire.jpg',
            address: 'mehal piasa',
        },
        {   //should fail
            name: '',
            imageURL: 'cinema_empire.jpg',
            address: 'mehal piasa',
        }
        
    ],
    admin_login_test_set: [
        {user_name: 'dawitgizaw', password: 'password'}, // should work! account already setup!
        {user_name: 'bogus', password: 'bogus'}, // should fail b/c bogus credentials
        {user_name: '', password: 'hahahaha'} // should fail b/c 1 or more fields empty
    ]
}

// header must have fields name and value
// param expected is of type boolean for success
function postWithToken(url, header, data, expected, done) {  
    chai.request(server)
        .post(url)
        .set(header.name, header.value)
        .send(data)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.success.should.be.eql(expected);
            done();
        });
}

function postWithoutHeader(url, data, expected, done) {
    chai.request(server)
        .post(url)
        .send(data)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.success.should.be.eql(expected);
            done();
        });
}

function getWithToken(url, header, expected, done) {
    chai.request(server)
        .get(url)
        .set(header.name, header.value)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.success.should.be.eql(expected);
            done();
        });
}

function getWithoutHeader(url, expected, done) {  
    chai.request(server)
        .get(url)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.success.should.be.eql(expected);
            done();
        });
}

function buildPostWithHeader(url, header, data) {
    return chai.request(server).post(url).set(header.name, header.value).send(data);
}

function buildPostWithOutHeader(url, data) {
    return chai.request(server).post(url).send(data);
}

// parent block
describe('/user', () => {
    before((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            seedVouchers(done);
        });
    });
  
    describe('/signup user', () => {
        const url = '/user/signup';
        it('it should create a user', (done) => {
            let user = test_set.sign_up_test_set[0];
            postWithoutHeader(url, user, true, done);
        });
        it('should fail b/c username already taken', (done) => {
            let user = test_set.sign_up_test_set[1];
            postWithoutHeader(url,  user, false, done);
        });

        it('should fail b/c one or more fields sent empty', (done) => {
            let user = test_set.sign_up_test_set[2];
            postWithoutHeader(url,  user, false, done);
        });
    });

    describe('/login user', () => {
        const url = '/user/login';

        it('login should succeed', (done) => {
            let user_cred = test_set.login_test_set[0];
            postWithoutHeader(url, user_cred, true, done);
        });

        it('should not login b/c account does not exist', (done) => {
            let user_cred = test_set.login_test_set[1];
            postWithoutHeader(url, user_cred, false, done);
        });
        it('should not login b/c incorrect password', (done) => {
            let user_cred = test_set.login_test_set[2];
            postWithoutHeader(url, user_cred, false, done);
        });
        it('should not login b/c 1 or more credentials empty', (done) => {
            let user_cred = test_set.login_test_set[3];
            postWithoutHeader(url, user_cred, false, done);
        });
    });

    describe('/recharge user account balance', () => {
        const url = '/user/recharge';
        const header = {name: 'token', value: user_test_token};

        it('should recharge 25 birr', (done) => {
            let voucher = test_set.recharge_test_set[0];
            postWithToken(url, header, voucher, true, done);
        });
        it('should fail to rechage b/c voucher can not be used again', (done) => {
            let voucher = test_set.recharge_test_set[1];
            postWithToken(url, header, voucher, false, done);
        });
        it('should fail to rechage b/c empty voucher number sent', (done) => {
            let voucher = test_set.recharge_test_set[2];
            postWithToken(url, header, voucher, false, done);
        });
        it('should fail to rechage b/c no such voucher number exists', (done) => {
            let voucher = test_set.recharge_test_set[3];
            postWithToken(url, header, voucher, false, done);
        });
        it('should fail to rechage b/c voucher numbers are numbers not strings', (done) => {
            let voucher = test_set.recharge_test_set[4];
            postWithToken(url, header, voucher, false, done);
        })
    });

    describe('/account_info user account information', () => {
        const url = '/user/account_info';

        it('should get account info b/c token is valid', (done) => {
            let token = user_test_token;
            getWithToken(url, {name: 'token', value: token}, true, done);
        });
        it('should fail b/c token is invalid', (done) => {
            let token = test_set.account_info_test_set[0];
            getWithToken(url, {name: 'token', value: token}, false, done);
        });
        it('should fail b/c token must be sent', (done) => {
            let token = test_set.account_info_test_set[1];
            getWithToken(url, {name: 'token', value: token}, false, done);
        });
    });
});

describe('/admin', () => {
    describe('/login', () => {
        const url = '/admin/login';
        it('should pass b/c correct credentials', (done) => {
            const credential = test_set.admin_login_test_set[0];
            postWithoutHeader(url, credential, true, done);
        });

        it('should fail b/c incorrect credentials', (done) => {
            const credential = test_set.admin_login_test_set[1];
            postWithoutHeader(url, credential, false, done);
        });

        it('should fail b/c 1 or more fields empty', (done) => {
            const credential = test_set.admin_login_test_set[2];
            postWithoutHeader(url, credential, false, done);
        })
    })
})

describe('/movie', () => {
    before((done) => {
        Movie.remove({}, (err) => {
            done();
        })
    });

    describe('/all_movies get a list of movies', () => {
        const url = '/movie/all_movies';                    
        it('list length should be 0 b/c no movies in the db', (done) => {
            chai.request(server).get(url).end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(0);
                done();
            });
        });
    });

    describe('/add_movie add a single movie', () => {
        const url = '/movie/add_movie';                    
        const header = {name: 'token', value: admin_test_token};

        it('should add a movie to the db', (done) => {
            const movie = test_set.add_movie_test_set[0];
            // postWithToken(url, header, movie, true, done);
            buildPostWithHeader(url, header, movie).end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                movie_id = res.body.data.id;
                done();
            })
        });

        it('should fail because one or more fields missing', (done) => {
            const movie = test_set.add_movie_test_set[1];
            postWithToken(url, header, movie, false, done);
        });
    })

    describe('/all_movies get a list of movies', () => {
        const url = '/movie/all_movies';                    
        it('list length should be 1 b/c a movie has been added', (done) => {
            chai.request(server).get(url).end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(1);
                done();
            });
        });
    });

    describe('/a_movie get a single movie', () => {
        const url = '/movie/a_movie';
        const header = {name: 'token', value: admin_test_token};

        it('should get a movie b/c movie id is correct', (done) => {
            getWithToken(`${url}/${movie_id}`, header, true, done);
        })

        it('should failb/c movie id is bogus', (done) => {
            getWithToken(`${url}/somebogusid`, header, false, done);
        })
    })
})

describe('/cinema', () => {
    before((done) => {
        Cinema.remove({}, (err) => {
            done();
        })
    });

    describe('/all_cinemas get a list of cinemas', () => {
        const url = '/cinema/all_cinemas';                    
        it('list length should be 0 b/c no cinemas in the db', (done) => {
            chai.request(server).get(url).end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(0);
                done();
            });
        });
    });

    describe('/add_cinema add a single movie', () => {
        const url = '/cinema/add_cinema';                    
        const header = {name: 'token', value: admin_test_token};

        it('should add a cinema to the db', (done) => {
            const cinema = test_set.add_cinema_test_set[0];
            // postWithToken(url, header, cinema, true, done);
            buildPostWithHeader(url, header, cinema).end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                cinema_id = res.body.data.id;
                done();
            })
        });

        it('should fail because one or more fields missing', (done) => {
            const cinema = test_set.add_cinema_test_set[1];
            postWithToken(url, header, cinema, false, done);
        });
    })

    describe('/all_cinemas get a list of movies', () => {
        const url = '/cinema/all_cinemas';                    
        it('list length should be 1 b/c a cinema has been added', (done) => {
            chai.request(server).get(url).end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(1);
                done();
            });
        });
    });

    describe('/a_cinema get a single cinema', () => {
        const url = '/cinema/a_cinema';
        const header = {name: 'token', value: admin_test_token};

        it('should get a cinema b/c cinema id is correct', (done) => {
            getWithToken(`${url}/${cinema_id}`, header, true, done);
        })

        it('should failb/c cinema id is bogus', (done) => {
            getWithToken(`${url}/somebogusid`, header, false, done);
        })
    })
})
