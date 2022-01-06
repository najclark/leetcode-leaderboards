const User = require('../models/User')

module.exports = {
    hasLeetcodeUsername: (req, res, next) => {
        User.findOne({ _id: req.session.passport.user }).then((user) => {
            if (user && user.leetcodeUsername) {
                return next()
            } else {
                res.redirect('/leetcodeform')
            }
        })
    },
    hasNoLeetcodeUsername: (req, res, next) => {
        User.findOne({ _id: req.session.passport.user }).then((user) => {
            if (user && user.leetcodeUsername) {
                res.redirect('/leaderboards')
            } else {
                return next()
            }
        })
    }
}