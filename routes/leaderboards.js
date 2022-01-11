const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const { hasLeetcodeUsername } = require('../middleware/leetcode')
const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')
const { nextContest } = require('../logic/contest')
const { updateSubmissions } = require('../logic/submissions')

// @desc    leaderboards page
// @route   GET /leaderboards
router.get('/', ensureAuth, hasLeetcodeUsername, async (req, res) => {
    const userLeaderboards = req.user.leaderboards
    
    try {
        let leaderboards = await Leaderboard.find({
            '_id': { $in: userLeaderboards }
        }).populate({ 
            path: 'users',
            populate: {
              path: 'user',
              model: 'User'
            } 
        }).lean()

        leaderboards = leaderboards.map((leaderboard) => {
            leaderboard.findQuestion = () => {
                console.log(`Find a question for leaderboard ${leaderboard.name}`)
            }
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
    let leaderboard = await Leaderboard.create(req.body)

    const user = await User.findById(req.user._id)
    user.leaderboards.push(leaderboard._id)
    user.save()

    leaderboard = await Leaderboard.findById(leaderboard._id).populate({ 
        path: 'users',
        populate: {
          path: 'user',
          model: 'User'
        } 
    })
    await nextContest(leaderboard, null, false)

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
                if (userDetails.user.id === req.user.id) {
                    alreadyJoined = true
                }
                return userDetails.admin
            })
            leaderboard.users = admins
            leaderboard.alreadyJoined = alreadyJoined
            return leaderboard
        })

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
    // TODO: add password protection logic
    try {
        const leaderboard = await Leaderboard.findById(req.body._id)
        leaderboard.users.push({
            user: req.user._id,
            admin: false,
            submission: {
                status: 'No Submission'
            }
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

    res.render('leaderboardhistory', {
        leaderboard,
        user: req.user
    })
})

module.exports = router