const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    googleId: String,
    displayName: String,
    firstName: String,
    lastName: String,
    image: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    leetcodeUsername: String
})

const User = mongoose.model('User', UserSchema)

module.exports = User