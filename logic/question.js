const moment = require('moment')
const { randomQuestion } = require('./leetcode')

const nextQuestion = async (leaderboard, saveCurrentQuestion) => {
    try {
        // Save the current question in the question history
        if (leaderboard.currentQuestion && saveCurrentQuestion) {
            leaderboard.questionHistory.push({
                question: leaderboard.currentQuestion.question,
                expiration: leaderboard.currentQuestion.expiration,
                usersSnapshot: leaderboard.users
            })
        }

        // Reset current question
        leaderboard.currentQuestion = null
        leaderboard.users.map((userData) => {
            userData.submission = {
                status: 'No Submission'
            }
        })

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
    nextQuestion
}