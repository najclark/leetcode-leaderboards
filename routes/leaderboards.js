const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { hasLeetcodeUsername, hasNoLeetcodeUsername } = require('../middleware/leetcode')
const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')

// @desc    leaderboards page
// @route   GET /leaderboards
router.get('/', ensureAuth, hasLeetcodeUsername, async (req, res) => {
    const userLeaderboards = req.user.leaderboards

    try {
        const leaderboards = await Leaderboard.find({
            '_id': { $in: userLeaderboards }
        }).populate({ 
            path: 'users',
            populate: {
              path: 'user',
              model: 'User'
            } 
        }).lean()

        res.render('leaderboards', {
            leaderboards,
            user: req.user
        })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// @desc    Form asking creating a leaderboard
// @route   GET /leaderboards/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('leaderboardform', {
        layout: 'login'
    })
})

// @desc    Form asking creating a leaderboard submitted
// @route   POST /leaderboards/add/create
router.post('/add/create', ensureAuth, async (req, res) => {
    req.body.users = [{
        user: req.user._id,
        admin: true
    }]
    const leaderboard = await Leaderboard.create(req.body)

    const user = await User.findById(req.user._id)
    user.leaderboards.push(leaderboard._id)
    user.save()

    res.redirect('/leaderboards')
})

// @desc    Searches for leaderboards with a given name
// @route   POST /leaderboards/add/search
router.post('/add/search', ensureAuth, async (req, res) => {
    try {
        const leaderboards = await Leaderboard.find({
            name: { $regex : new RegExp(req.body.name, "i") }
        }).populate({ 
            path: 'users',
            populate: {
              path: 'user',
              model: 'User'
            } 
        }).lean()

        const results = leaderboards.map((leaderboard) => {
            let alreadyJoined = false
            const users = leaderboard.users
            const admins = users.filter((userDetails) => {
                console.log(userDetails.user.id)
                console.log(req.user.id)
                console.log(userDetails.user.id === req.user.id)
                if (userDetails.user.id === req.user.id) {
                    alreadyJoined = true
                }
                return userDetails.admin
            })
            leaderboard.users = admins
            leaderboard.alreadyJoined = alreadyJoined
            return leaderboard
        })

        console.log(results)
        res.render('leaderboardform', {
            layout: 'login',
            results,
            user: req.user
        })
    } catch(err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// @desc    Joining an existing leaderboard
// @route   POST /leaderboards/add/join
router.post('/add/join', ensureAuth, async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.body._id)
        leaderboard.users.push({
            user: req.user._id,
            admin: false
        })
        leaderboard.save()
    
        const user = await User.findById(req.user._id)
        user.leaderboards.push(leaderboard._id)
        user.save()
    
        res.redirect('/leaderboards')
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router