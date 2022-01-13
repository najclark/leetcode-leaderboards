const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const User = require('../models/User')
const { userDetails } = require('../logic/leetcode')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

// @desc    Form asking for leetcode username
// @route   GET /leetcodeform
router.get('/leetcodeform', ensureAuth, (req, res) => {
    res.render('leetcodeform', {
        layout: 'login'
    })
})

// @desc    Form verifying leetcode username
// @route   GET /leetcodeform/verify
router.post('/leetcodeform/verify', ensureAuth, async (req, res) => {
    const result = await userDetails(req.body.username)
    result.totalCompleted = result.submitStats.acSubmissionNum[0].count
    
    res.render('leetcodeverify', {
        layout: 'login',
        username: req.body.username,
        result
    })
})

// @desc    Form asking for leetcode username submitted
// @route   POST /leetcodeform/submit
router.post('/leetcodeform/submit', ensureAuth, (req, res) => {
    User.findByIdAndUpdate(req.user.id, { leetcodeUsername: req.body.username }, (err, doc) => {
        if (err) {
            console.error(err)
        }
    })
    console.log(req.user.id)
    res.redirect('/leaderboards')
})

module.exports = router