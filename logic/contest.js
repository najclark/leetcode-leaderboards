const moment = require('moment')
const { updateSubmissions } = require('./submissions')
const { nextQuestion } = require('./question')
const schedule = require('node-schedule');

// @Pre leaderboard must have users populated
const resumeContest = async (leaderboard, updateJob, saveCurrentQuestion = true) => {
    // Cancle the existing submissions update interval
    if (updateJob) {
        updateJob.cancel()
    }

    if (leaderboard.currentQuestion) {
        const error = await updateSubmissions(leaderboard)
        if (error) return // Don't setup update jobs if leaderboard no longer exists

        // Setup update submissions interval (every 5 minutes)
        const updateJob = schedule.scheduleJob('*/5 * * *', async () =>{
            console.log(`Updating ${leaderboard.name}'s submissions'`)
            const error = await updateSubmissions(leaderboard)
            if (error) updateJob.cancel()
        })

        // Setup end current question job
        schedule.scheduleJob(leaderboard.currentQuestion.expiration, function(){
            nextContest(leaderboard, updateJob)
        });
    } else {
        nextContest(leaderboard, updateJob, saveCurrentQuestion)
    }
}

// @Pre leaderboard must have users populated
const nextContest = async (leaderboard, updateJob, saveCurrentQuestion = true) => {
    // Cancle the existing submissions update job
    if (updateJob) {
        updateJob.cancel()
    }

    if (leaderboard.currentQuestion.question) {
        const error = await updateSubmissions(leaderboard)
        if (error) {
            return // Don't setup jobs to update this leaderboard
        }
    }
    
    const expiration = await nextQuestion(leaderboard, saveCurrentQuestion)

    if (expiration < -1) {
        return //Don't setup jobs to update this leaderboard
    }
    else if (expiration) {
        // Setup update submissions interval (every 5 minutes)
        const updateJob = schedule.scheduleJob('*/5 * * * *', async () =>{
            console.log(`Updating ${leaderboard.name}'s submissions'`)
            const error = await updateSubmissions(leaderboard)
            if (error) updateJob.cancel()
        })

        // Setup end current question job
        schedule.scheduleJob(expiration, function(){
            nextContest(leaderboard, updateJob)
        });
    }
}

module.exports = {
    resumeContest,
    nextContest
}