const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const { hasLeetcodeUsername } = require('../middleware/leetcode')
const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')
const { nextContest } = require('../logic/contest')
const { updateSubmissions } = require('../logic/submissions')

router.use('/add', require('./add'))

// @desc    leaderboards page
// @route   GET /leaderboards
router.get('/', ensureAuth, hasLeetcodeUsername, async (req, res) => {
    const userLeaderboards = req.user.leaderboards
    
    try {
        let leaderboards = await Leaderboard.find({
            '_id': { $in: userLeaderboards }
        }).populate({ 
            path: 'users.user',
            model: 'User'
        }).lean()

        // Sort by points and put current user first
        leaderboards = leaderboards.map((leaderboard) => {
            leaderboard.users.sort((a, b) => {
                if (a.user._id.equals(req.user._id)) {
                    return -1
                } else if (b.user._id.equals(req.user._id)) {
                    return 1
                } else {
                    return b.points - a.points
                }
            })
            return leaderboard
        })

        res.render('leaderboards', {
            leaderboards,
            user: req.user
        })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// @desc    Force finding a question for a leaderboard
// @route   POST /leaderboards/add/join
router.post('/findquestion', ensureAuth, async (req, res) => {
    // TODO: phase this out, replace by finding a question on leaderboard creation
    try {
        const leaderboard = await Leaderboard.findById(req.body._id).populate({ 
            path: 'users',
            populate: {
              path: 'user',
              model: 'User'
            } 
        })
        await nextContest(leaderboard, null)
    
        res.redirect('/leaderboards')
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// @desc    Leave a leaderboard
// @route   POST /leaderboards/leave
router.post('/leave', ensureAuth, async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.body._id)
        
        leaderboard.users = leaderboard.users.filter((userDetails) => {
            return userDetails.user != req.user.id
        })

        if (leaderboard.users.length === 0) {
            leaderboard.delete()
        } else {
            leaderboard.save()
        }

        const user = await User.findById(req.user._id)
        user.leaderboards = user.leaderboards.filter((L) => {
            return L != leaderboard.id
        })
        user.save()
    
        res.redirect('/leaderboards')
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// @desc    Refresh a leaderboard's submissions
// @route   POST /leaderboards/refreshSubmissions
router.post('/refreshSubmissions', ensureAuth, async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.body._id).populate({ 
            path: 'users',
            populate: {
              path: 'user',
              model: 'User'
            } 
        })
        await updateSubmissions(leaderboard)
    
        res.redirect('/leaderboards')
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// @desc    Question history / Join a leaderboard by shortId
// @route   GET /leaderboards/:shortId
router.get('/:shortId', ensureAuth, async (req, res) => {
    const leaderboard = await Leaderboard.findOne({ 
        shortId: req.params.shortId 
    }).populate({ 
        path: 'users',
        populate: {
          path: 'user',
          model: 'User'
        } 
    }).populate({ 
        path: 'questionHistory.usersSnapshot.user',
        model: 'User'
    })
    
    // Reverse questionHistory to have most recent question first
    leaderboard.questionHistory.reverse()

    alreadyJoined = false
    leaderboard.users.every((userData) => {
        if (userData.user._id.equals(req.user._id)) {
            alreadyJoined = true
            return false // stop iterating
        }
        return true
    })

    res.render('leaderboardhistory', {
        leaderboard,
        user: req.user,
        alreadyJoined,
        wrongPassword: req.query.wrongPassword
    })
})

module.exports = router