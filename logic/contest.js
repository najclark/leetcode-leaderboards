const moment = require('moment')
const { randomQuestion } = require('./leetcode')
const { updateSubmissions } = require('./submissions')

// @Pre leaderboard must have users populated
const resumeContest = async (leaderboard, updateInterval, saveCurrentQuestion = true) => {
    // Cancle the existing submissions update interval
    if (updateInterval) {
        clearInterval(updateInterval)
    }

    if (leaderboard.currentQuestion) {
        await updateSubmissions(leaderboard)

        // Setup update submissions interval
        updateInterval = setInterval(async () => {
            await updateSubmissions(leaderboard)
        }, 1000 * 60 * 5) // 5 minutes

        // Setup end current question timeout
        setTimeout(() => {
            nextContest(leaderboard, updateInterval)
        }, Math.abs(moment().diff(moment(leaderboard.currentQuestion.expiration))))
    } else {
        nextContest(leaderboard, updateInterval, saveCurrentQuestion)
    }
}

// @Pre leaderboard must have users populated
const nextContest = async (leaderboard, updateInterval, saveCurrentQuestion = true) => {
    // Cancle the existing submissions update interval
    if (updateInterval) {
        clearInterval(updateInterval)
    }

    if (leaderboard.currentQuestion) {
        await updateSubmissions(leaderboard)
    }
    
    const expiration = await nextQuestion(leaderboard, saveCurrentQuestion)

    if (expiration) {
        // Setup update submissions interval
        updateInterval = setInterval(async () => {
            console.log(`Updating ${leaderboard.name}'s submissions`)
            await updateSubmissions(leaderboard)
        }, 1000 * 60 * 5) // 5 minutes

        // Setup end current question timeout
        setTimeout(() => {
            nextContest(leaderboard, updateInterval)
        }, Math.abs(moment().diff(expiration)))
    }
}

module.exports = {
    resumeContest,
    nextContest
}