const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')


module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        // Callback method triggered upon signing in
        try {
            let user = await User.findOne({ googleId: profile.id })

            if (!user) {
                user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        image: profile.photos[0].value,
                        preferredLayout: 'card'
                    })
            }
            done(null, user)
        } catch (err) {
            console.error(err)
        }
    }
    ))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    
    passport.deserializeUser((user, done) => {
        User.findOne({ _id: user }, (err, user) => done(err, user))
    })
}