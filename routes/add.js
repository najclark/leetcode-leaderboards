const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')
const { nextContest } = require('../logic/contest')
const { body, validationResult } = require('express-validator');

// @desc    Form asking creating a leaderboard
// @route   GET /leaderboards/add
router.get('/', ensureAuth, async (req, res) => {
    try {
        // Get requested leaderboards (either all or ones matching search regex)
        const leaderboards = await Leaderboard.find({
            name: { $regex : new RegExp(req.query.search, "i") }
        })
        .populate({ 
            path: 'users.user',
            model: 'User'
        }).lean()

        const results = leaderboards.map((leaderboard) => {
            let alreadyJoined = false
            const users = leaderboard.users
            const admins = users.filter((userDetails) => {
                if (userDetails.user._id.equals(req.user._id)) {
                    alreadyJoined = true
                }
                return userDetails.admin
            })
            leaderboard.users = admins
            leaderboard.alreadyJoined = alreadyJoined
            return leaderboard
        })

        // Check for potential create leaderboard errors
        const createErrors = req.session.createErrors
        delete req.session.createErrors
        if (createErrors) {
            res.render('leaderboardform', {
                layout: 'login',
                create: true,
                results,
                user: req.user,
                wrongPassword: req.query.wrongPassword,
                search: req.query.sççearch,
                ...createErrors
            })
        } else {
            // No create errors, render normally
            res.render('leaderboardform', {
                layout: 'login',
                results,
                user: req.user,
                wrongPassword: req.query.wrongPassword,
                search: req.query.search
            })
        }
    } catch(err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// @desc    Form asking creating a leaderboard submitted
// @route   POST /leaderboards/add/create
router.post(
    '/create', 
    ensureAuth, 
    body('name', 'Leaderboard name cannot be empty').notEmpty().trim(), 
    body('questionDifficulties', 'Must select question difficulties').notEmpty(),
    body('numQuestions', 'Number of questions must be positive integer (between 1 and 99)').isInt({ min: 1, max: 99 }),
    body('timePeriod', 'Must select a time period').notEmpty(),
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            req.session.createErrors = result.mapped()
            res.redirect('/leaderboards/add')
            return
        }
        
        req.body.users = [{
            user: req.user._id,
            admin: true
        }]
        req.body.questionFrequency = {
            numQuestions: req.body.numQuestions,
            timePeriod: req.body.timePeriod
        }
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

// @desc    Try to join an existing leaderboard
// @route   POST /leaderboards/add/join
router.post('/join', ensureAuth, async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findById(req.body._id)

        if (leaderboard.password && req.body.password !== leaderboard.password) {
            res.redirect(`${req.body.failureRedirect}?wrongPassword=true&search=${req.body.search}`)
        } else {
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
        
            res.redirect(`${req.body.successRedirect}`)
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router