const Leaderboard = require("../models/Leaderboard")
const { resumeContest, nextContest } = require('./contest')

const initContests = async () => {
    try {
        const leaderboards = await Leaderboard.find({}).populate({ 
            path: 'users',
            populate: {
              path: 'user',
              model: 'User'
            } 
        })
        
        leaderboards.forEach((leaderboard) => {
            // Start a new contest for every leaderboard on startup
            resumeContest(leaderboard, null, false)
            // nextContest(leaderboard, null, true)
        })
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    initContests
}