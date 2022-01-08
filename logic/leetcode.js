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

module.exports = {
    randomQuestion,
    currentTimestamp
}