const Leaderboard = require("../models/Leaderboard")
const { recentUserSubmissions } = require('./leetcode')
const moment = require('moment')

const updateSubmissions = async (leaderboard) => {
    try {
        // Skip if there is no current question
        if (!leaderboard.currentQuestion) return;
        // Update the users submissions statuses
        await Promise.all(leaderboard.users.map(async (userData) => {
            // Get a users recent submissions
            const recentSubmissions = await recentUserSubmissions(userData.user.leetcodeUsername)
            if (!recentSubmissions) return userData

            // Search through user's recent submission to look for most recent submission relating
            // to the current question
            recentSubmissions.every((recentSubmission) => {
                if (recentSubmission.titleSlug == leaderboard.currentQuestion.question.titleSlug) {
                    // Create user submission object if not created
                    if (!userData.submission) {
                        userData.submission = {}
                    }
                    userData.submission.status = recentSubmission.statusDisplay
                    // Update submission specifics if the submission was accepted
                    if (recentSubmission.statusDisplay == 'Accepted') {
                        userData.submission.runtime = recentSubmission.runtime
                        userData.submission.memory = recentSubmission.memory
                        userData.submission.lang = recentSubmission.lang
                        userData.submission.time = moment().toDate()
                        // userData.user.points += 10
                        // TODO: handle adding points bc it is not trivial avoid readding points already allotted,
                        //       maybe update points when contest is over to simplify things
                    }

                    return false // return false to prevent iterating further through recentSubmissions
                }
                return true // return true to continue iterating through recentSubmissions
            })
            
            return userData
        }))
        
        leaderboard.submissionStatusLastUpdated = moment().toDate()

        try {
            leaderboard.save({ validateBeforeSave: false })
        } catch (err) {
            // Leaderboard likely no longer exists
            return -1
        }
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    updateSubmissions
}