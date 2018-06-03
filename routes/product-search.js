const router = require('express').Router();
const async = require('async');
const Product = require('../models/product');

//const algoliasearch = require('algoliasearch');
//const client = algoliasearch('MBVBNDB9WM','2e3f67bf498db2d476a77d58a406f5db');
//const index = client.initIndex('amazonov1');

/*router.get('/', (req, res, next) => {
    if (req.query.query) {
        index.search({
            query: req.query.query,
            page: req.query.page
        }, (err, content) => {
            res.json({
                success: true,
                message: "Here is your search",
                status: 200,
                content: content,
                search_result: req.query.query
            });
        });
    }
});*/

router.get('/', (req, res, next) => {
    const perPage = 10;
    const page = req.query.page;
    /*if (req.query.query) {
        Product.find({ title: {$regex: req.query.query, $options: "$i"}})
            .populate('owner', 'name')
            .populate('reviews', 'rating')
            .exec((err, content) => {
                Product.count({title: {$regex: req.query.query, $options: "$i"}}, (err, nbHits) => {
                    if (content) {
                        res.json({
                            success: true,
                            message: "Here is your search",
                            status: 200,
                            content: content,
                            nbHits: nbHits,
                            pages: Math.ceil(nbHits / perPage),
                            search_result: req.query.query
                        });
                    }
                })
            });
    }*/
    async.parallel([
        function(callback) {
            Product.count({ title: { $regex: req.query.query, $options: "$i" }}, (err, count) => {
                var nbHits = count;
                callback(err, nbHits);
            });
        },
        function(callback) {
            Product.find({ title: { $regex: req.query.query, $options: "$i" }})
                .skip(perPage * page)
                .limit(perPage)
                .populate('owner', 'name')
                .populate('reviews', 'rating')
                .exec((err, content) => {
                    if(err) return next(err);
                    callback(err, content);
                });
        }
    ], function (err, results) {
            var nbHits = results[0];
            var content = results[1];
            if (content) {
                res.json({
                    success: true,
                    message: "Here is your search",
                    status: 200,
                    content: content,
                    nbHits: nbHits,
                    pages: Math.ceil(nbHits / perPage),
                    search_result: req.query.query
                });
            }
        })
});


module.exports = router;