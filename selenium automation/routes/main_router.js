var router = require('express').Router();
var news_storage = require('../model/news_storage.json')

router.post('/upload_news', function (req, res) {  
    const news = req.body['news'];
    news_storage.push(news);
    res.send(news);
});

router.get('/upload' , function(req, res) {
    res.sendfile('public/html/upload.html');
});

router.get('/news', function (req, res) {  
    res.send(news_storage);
});

router.get('/', function(req, res) {
    res.sendfile('index.html');
});

module.exports = router;