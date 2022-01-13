const axios = require('axios')

const randomQuestion = async (difficulty) => {
    const data = await axios.post('https://leetcode.com/graphql', {
            query: 
            `query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) {
                randomQuestion(categorySlug: $categorySlug, filters: $filters) {
                    categoryTitle
                    isPaidOnly
                    titleSlug
                    questionId
                    title
                    difficulty
                    likes
                    dislikes
                    similarQuestions
                    questionDetailUrl
                    topicTags {
                        name
                    }
                    stats
                    content
                }
            }`,
            variables: {
                categorySlug: "",
                filters: {
                    "difficulty": difficulty.toUpperCase(),
                    "tags": "Algorithms"
                }
            }
        }, 
        {
        headers: {
            'Content-Type': 'application/json'
          }
    })
    return data.data.data.randomQuestion
}

const currentTimestamp = async () => {
    const data = await axios.post('https://leetcode.com/graphql', {
            query: `query currentTimestamp {
                currentTimestamp
            }`
        }, 
        {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return data
}

const recentUserSubmissions = async (leetcodeUsername) => {
    const data = await axios.post('https://leetcode.com/graphql', {
            query: 
            `query recentUserSubmissionList($username: String!) {
                recentSubmissionList(username: $username, limit: 1000) {
                    title
                    titleSlug
                    timestamp
                    statusDisplay
                    lang
                    runtime
                    memory
                }
            }`,
            variables: {
                username: leetcodeUsername
            }
        }, 
        {
        headers: {
            'Content-Type': 'application/json'
          }
    })
    
    return data.data.data.recentSubmissionList
}

const userDetails = async (leetcodeUsername) => {
    const data = await axios.post('https://leetcode.com/graphql', {
            query: 
            `query matchedUser($username: String!){ 
                matchedUser(username: $username) {
                    username
                    profile {
                        userAvatar
                    }
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }`,
            variables: {
                username: leetcodeUsername
            }
        }, 
        {
        headers: {
            'Content-Type': 'application/json'
          }
    })
    
    return data.data.data.matchedUser
}


module.exports = {
    randomQuestion,
    currentTimestamp,
    recentUserSubmissions,
    userDetails
}