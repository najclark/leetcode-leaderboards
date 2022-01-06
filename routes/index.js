const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { hasLeetcodeUsername, hasNoLeetcodeUsername } = require('../middleware/leetcode')
const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

// @desc    Leaderboards page
// @route   GET /leaderboards
router.get('/leaderboards', ensureAuth, hasLeetcodeUsername, (req, res) => {
    const leaderboards = req.user.leaderboards

    Leaderboard.find({
        '_id': { $in: leaderboards}
    }, (err, docs) => {
         console.log(docs);
    });

    res.render('leaderboards')
})


// @desc    Form asking for leetcode username
// @route   GET /leetcodeform
router.get('/leetcodeform', ensureAuth, hasNoLeetcodeUsername, (req, res) => {
    res.render('leetcodeform', {
        layout: 'login'
    })
})

// @desc    Form asking for leetcode username submitted
// @route   POST /leetcodeform/submit
router.post('/leetcodeform/submit', ensureAuth, (req, res) => {
    User.findOneAndUpdate({ _id: req.session.passport.user }, { leetcodeUsername: req.body.username }).then((user) => console.log(user))

    res.redirect('/leaderboards')
})

// @desc    Form asking creating a leaderboard
// @route   GET /createleaderboard
router.get('/createleaderboard', ensureAuth, (req, res) => {
    res.render('leaderboardform', {
        layout: 'login'
    })
})

// @desc    Form asking creating a leaderboard submitted
// @route   POST /createleaderboard/submit
router.post('/createleaderboard/submit', ensureAuth, (req, res) => {
    Leaderboard.create({
        name: req.body.name,
        password: req.body.password,
        questionDifficulties: req.body.difficulties,
        questionFrequency: req.body.frequency,
        users: [{
            id: req.user._id,
            admin: true
        }]
    })
    res.redirect('/leaderboards')
})

module.exports = router