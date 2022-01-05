const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

// @desc    Leaderboards page
// @route   GET /leaderboards
router.get('/leaderboards', ensureAuth, (req, res) => {
    res.render('leaderboards')
})


module.exports = router