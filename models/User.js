const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    googleId: String,
    displayName: String,
    firstName: String,
    lastName: String,
    image: String,
    leetcodeUsername: String,
    leaderboards: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', UserSchema)

module.exports = User