const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
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
router.get('/leetcodeform', ensureAuth, (req, res) => {
    res.render('leetcodeform', {
        layout: 'login'
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