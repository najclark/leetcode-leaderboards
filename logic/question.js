const moment = require('moment')
const Leaderboard = require("../models/Leaderboard")
const { randomQuestion } = require('./leetcode')
const { updateSubmissions } = require('./submissions')

const nextContest = async (leaderboard, updateInterval, saveCurrentQuestion = true) => {
    // Cancle the existing submissions update interval
    if (updateInterval) {
        clearInterval(updateInterval)
    }

    updateSubmissions(leaderboard)
    const expiration = await nextQuestion(leaderboard, saveCurrentQuestion)

    if (expiration) {
        // Setup update submissions interval
        updateInterval = setInterval(() => {
            updateSubmissions(leaderboard)
        }, 1000 * 60 * 5) // 5 minutes

        // Setup end current question timeout
        setTimeout(() => {
            nextContest(leaderboard, updateInterval)
        }, Math.abs(moment().diff(expiration)))
    }
}

const nextQuestion = async (leaderboard, saveCurrentQuestion) => {
    try {
        // Save the current question in the question history
        if (leaderboard.currentQuestion && saveCurrentQuestion) {
            leaderboard.questionHistory.push({
                question: leaderboard.currentQuestion.question,
                expiration: leaderboard.currentQuestion.expiration,
                submissionStatus: leaderboard.submissionStatus
            })
        }

        // Reset current question
        leaderboard.currentQuestion = null
        leaderboard.submissionStatus = []

        // Find new question
        let oldQuestions = leaderboard.questionHistory || []
        oldQuestions = oldQuestions.map((questionInfo) => {
            if (!questionInfo.question) {
                return ""
            }
            return questionInfo.question.titleSlug
        })

        let question = null
        while (!question) {
            // Pick random difficulty
            const difficulty = leaderboard.questionDifficulties[Math.floor(Math.random()*leaderboard.questionDifficulties.length)]

            const potentialQuestion = await randomQuestion(difficulty)
            if (!potentialQuestion.isPaidOnly && 
                potentialQuestion.categoryTitle === 'Algorithms' &&
                !oldQuestions.includes(potentialQuestion.titleSlug)) {
                    question = potentialQuestion
            }
        }
        question.url = `https://leetcode.com${question.questionDetailUrl}`
        
        let expiration = null
        switch (leaderboard.questionFrequency) {
            case 'Every 12 Hours':
                expiration = new moment().add(12, 'hours').toDate()
                break;
            case 'Daily':
                expiration = new moment().add(1, 'days').toDate()
                break;
            case 'Weekly':
                expiration = new moment().add(1, 'weeks').toDate()
                break;
        }

        leaderboard.currentQuestion = {
            question,
            expiration
        }
        leaderboard.save()

        return expiration
    } catch (err) {
        console.error(err)
        return null
    }
}

module.exports = {
    nextQuestion,
    nextContest
}