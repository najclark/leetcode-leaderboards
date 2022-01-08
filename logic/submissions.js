const Leaderboard = require("../models/Leaderboard")
const { recentSubmissions } = require('./leetcode')

const updateSubmissions = (leaderboard) => {
    try {
        // TODO: implement updating the submission
        // leaderboard.save()

    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    updateSubmissions
}