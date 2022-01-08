const Leaderboard = require("../models/Leaderboard")
const { nextContest } = require('./question')

const initContests = () => {
    try {
        Leaderboard.find({} , (err, leaderboards) => {
            if (err) console.log(err)
            
            leaderboards.forEach((leaderboard) => {
                // Start a new contest for every leaderboard on startup
                nextContest(leaderboard, null, false)
            })
        })
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    initContests
}