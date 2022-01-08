const mongoose = require('mongoose')
const Schema = mongoose.Schema
const nanoid = require('nanoid')

const Difficulty = ['Easy', 'Medium', 'Hard']

const Question = new Schema({
    title: String,
    titleSlug: String,
    questionId: String,
    difficulty: {
        type: String,
        enum: Difficulty
    },
    likes: Number,
    dislikes: Number,
    url: String
})

const SubmissionStatus = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submissionTime: Date,
    submissionRuntime: String,
    submissionMemory: String,
    submissionLang: String
})

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
    questionDifficulties: [{
        type: String,
        enum: Difficulty
    }],
    questionFrequency: {
        type: String,
        enum: ['Every 12 Hours', 'Daily', 'Weekly']
    },
    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        admin: Boolean,
        points: {
            type: Number,
            default: 0
        }
    }],
    submissionStatus: [SubmissionStatus],
    currentQuestion: {
        question: Question,
        expiration: Date
    },
    questionHistory: [{
        question: Question,
        expiration: Date,
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