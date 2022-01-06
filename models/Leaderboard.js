const mongoose = require('mongoose')
const Schema = mongoose.Schema
const nanoid = require('nanoid')

const Difficulty = ['Easy', 'Medium', 'Hard']

const Question = {
    title: String,
    titleSlug: String,
    questionId: String,
    difficulty: Difficulty,
    likes: Number,
    dislikes: Number,
    url: String,
    expirationDate: Date
}

const SubmissionStatus = {
    _id: String,
    submissionTime: Date,
    submissionRuntime: String,
    submissionMemory: String,
    submissionLang: String
}

const LeaderboardSchema = new Schema({
    name: String,
    shortId: {
        type: String,
        unique: true,
        default: () => {
            return nanoid.nanoid(6)
        }
    },
    password: String,
    questionDifficulties: Difficulty,
    questionFrequency: {
        type: String,
        enum: ['Every 12 Hours', 'Daily', 'Weekly']
    },
    users: [{
        id: String,
        admin: Boolean
    }],
    submissionStatus: [SubmissionStatus],
    currentQuestion: Question,
    questionHistory: [{
        question: Question,
        submissionStatus: [SubmissionStatus]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema)

// TODO: implement pre save hook to verify shortId uniquness
// https://stackoverflow.com/questions/33920653/use-mongoose-hook-to-retry-saving-on-duplicate-key-error

module.exports = Leaderboard