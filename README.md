# 🏆 Leetcode Leaderboards
*A Leetcode contest system written in NodeJS and Express.*

The goal of this project is to create a platform to allow friends to work on the same leetcode problems to compete for points. The hope is for users to build up consistent study patterns of algorithmic technical interview questions by leveraging the wealth of questions and code submission platform on leetcode.

## Goals for Release 1.0 🚧
- [x] Connect with MongoDB
- [x] Integrate Google Oauth
- - [x] Be able to logout 
- [x] Be able to create a leaderboard
- - [x] Password protection for leaderboards
- - [ ] Be able to define \# of questions per time period (i.e. 3 questions per week, 1 question per day)
- [x] Be able to join an existing leaderboard
- - [ ] Require appropriate password to join password protected leaderboards
- [x] Display your leaderboards in a card layout
- [ ] Display your leaderboards in a list layout
- [x] Contest Logic
- - [x]  Startup Logic
  - - [x] Resume contests by setting up appropriate submission sync and next question intervals/timeouts
- - [x] [Leetcode](http://leetcode.com/graphql) queries
  - - [x] Random question of specified difficulty
  - - [x] Recent submissions of specified user
- - [x] Submission sync intervals for each leaderboard
- - [x] Next question timeouts for each leaderboard
- [x] Question history for each leaderboard
- - [x] Display question content
- - [x] Display status of user submissions 
- [ ] User settings
- - [ ] Be able to change leetcode username
 - - [ ] Leetcode username verification
- - [ ] Be able to toggle between leaderboard card and list layouts
- [x] Be able to leave a leaderboard
- - [ ] Are you sure you want to leave confirmation
- - [ ] Logic to handle assigning a new admin when an admin leaves
- [ ] Display order of submissions in order of points (with current user first)
- [ ] Add hover on question expiration to display in local time

## Goals for Release 1.1 🔮
- [ ] Topic tags integration
- - [ ] Display the topic tags for the current question
- - [ ] Display the topic tags for past questions
 - - [ ] Filter question history by topic tags
- - [ ] Be able to specify topic tags when creating a leaderboard
- [ ] Allow admin to be able to edit leaderboard features
- [ ] Allow users to star leaderboards (changing the order they appear on the leaderboards screan)
