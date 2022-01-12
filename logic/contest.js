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
        await updateSubmissions(leaderboard)

        // Setup update submissions interval (every 5 minutes)
        const updateJob = schedule.scheduleJob('*/5 * * *', async () =>{
            console.log(`Updating ${leaderboard.name}'s submissions'`)
            await updateSubmissions(leaderboard)
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
        await updateSubmissions(leaderboard)
    }
    
    const expiration = await nextQuestion(leaderboard, saveCurrentQuestion)

    if (expiration) {
        // Setup update submissions interval (every 5 minutes)
        const updateJob = schedule.scheduleJob('*/5 * * * *', async () =>{
            console.log(`Updating ${leaderboard.name}'s submissions'`)
            await updateSubmissions(leaderboard)
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