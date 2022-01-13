# 🏆 Leetcode Leaderboards
*A Leetcode contest system written in NodeJS and Express.*

The goal of this project is to create a platform to allow friends to work on the same leetcode problems to compete for points. The hope is for users to build up consistent study patterns of algorithmic technical interview questions by leveraging the wealth of questions and code submission platform on leetcode.

## Goals for Release 1.0 🚧
- [x] Connect with MongoDB
- [x] Integrate Google Oauth
- - [x] Be able to logout 
- [x] Be able to create a leaderboard
- - [x] Password protection for leaderboards
- - [x] Be able to define \# of questions per time period (i.e. 3 questions per week, 1 question per day)
- [x] Be able to join an existing leaderboard
- - [x] Require appropriate password to join password protected leaderboards
- [x] Display your leaderboards in a card layout
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
- - [x] Add join link to page if user isn't registered for leaderboard
- [x] User settings
- - [x] Be able to change leetcode username
 - - [x] Leetcode username verification
- [x] Be able to leave a leaderboard
- [x] Display order of submissions in order of points (with current user first)
- [x] Add hover on question expiration to display in local time
- [x] Update points when a contest is over
- [ ] Data validation
- [ ] Delete update jobs when leaderboard is deleted

## Goals for Release 1.1 🔮
- [ ] Topic tags integration
- - [ ] Display the topic tags for the current question
- - [ ] Display the topic tags for past questions
 - - [ ] Filter question history by topic tags
- - [ ] Be able to specify topic tags when creating a leaderboard
- [ ] Allow admin to be able to edit leaderboard features
- [ ] Allow users to star leaderboards (changing the order they appear on the leaderboards screan)
- [ ] Allow users to share a leaderboard (copying link to question history page)
- [ ] Leaving a leaderboard enhanced behavior
- - [ ] Logic to handle assigning a new admin when an admin leaves
- - [ ] Are you sure you want to leave confirmation
- [ ] Enhanced design
- - [ ] Be able to toggle between leaderboard card and list layouts
- - [ ] Display your leaderboards in a list layout
