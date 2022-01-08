const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { hasLeetcodeUsername, hasNoLeetcodeUsername } = require('../middleware/leetcode')
const User = require('../models/User')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
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

module.exports = router