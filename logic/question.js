const moment = require('moment')
const { randomQuestion } = require('./leetcode')

const questionWorth = (difficulty) => {
    switch (difficulty) {
        case 'Medium':
            return 20
        case 'Hard':
            return 30
        default:
            return 10;
    }
}

const nextQuestion = async (leaderboard, saveCurrentQuestion) => {
    try {
        // Save the current question in the question history
        if (leaderboard.currentQuestion && saveCurrentQuestion) {
            // Award points
            const pointsForGrab = questionWorth(leaderboard.currentQuestion.difficulty)
            leaderboard.users.map((userData) => {
                if (userData.submission.status == 'Accepted') {
                    userData.points += pointsForGrab
                }
                return userData
            })
            // Save user snapshot
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
        let tries = 0
        while (!question) {
            // Pick random difficulty
            const difficulty = leaderboard.questionDifficulties[Math.floor(Math.random()*leaderboard.questionDifficulties.length)]

            const potential = await randomQuestion(difficulty)
            if (!potential.isPaidOnly && potential.categoryTitle === 'Algorithms') {
                // Accept the question if it hasn't been done before or we've spent 
                // a while looking for a question
                if (!oldQuestions.includes(potential.titleSlug) || tries > 50) {
                    question = potential
                }
            }
            tries++
        }
        question.url = `https://leetcode.com${question.questionDetailUrl}`
        
        const future = moment().add(1, leaderboard.questionFrequency.timePeriod)
        const msDiff = Math.abs(moment().diff(future))
        const expiration = msDiff / leaderboard.questionFrequency.numQuestions

        leaderboard.currentQuestion = {
            question,
            expiration: moment().add(expiration, 'ms').toDate()
        }

        try {
            await leaderboard.save({ validateBeforeSave: false })
        } catch (err) {
            // Leaderboard likely no longer exists
            return -1
        }

        return moment().add(expiration, 'ms').toDate()
    } catch (err) {
        console.error(err)
        return null
    }
}

module.exports = {
    nextQuestion
}