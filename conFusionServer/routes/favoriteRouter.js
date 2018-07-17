const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorite.findOne({user:req.user})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user})
    .then((favorite) => {
        if (favorite != null) {
            var newDishes = req.body.map(a => a._id);
            newDishes.some((newDish) => {
                if(favorite.dishes.indexOf(newDish) == -1) {
                    favorite.dishes.push(newDish);
                };
            });
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
        } else {
            var user = req.user;
            var dishes = req.body;
            var newFav = {user: user, dishes: dishes};
            Favorite.create(newFav)
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user}).remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user})
    .then((favorite) => {
        if (favorite != null) {
            console.log('Dishes Added ', favorite);
            if(favorite.dishes.indexOf(req.params.dishId) == -1) {
                favorite.dishes.push(req.params.dishId);
            };
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
        } else {
            res.statusCode = 403;
            res.end('Favorite is not created for ' + req.user.username);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user})
    .then((favorite) => {
        favorite.dishes.remove(req.params.dishId);
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json("Removed the dish: " + req.params.dishId);                
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;