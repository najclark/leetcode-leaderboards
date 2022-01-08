// Load env
require('dotenv').config({ path: './config/config.env'})

// Passport config
const passport = require('passport')
require('./config/passport')(passport)

// Express setup
const express = require('express')
const app = express()

// Logging setup
if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan')
    app.use(morgan('dev'))
}

// Handlebars
const exphbs = require('express-handlebars')
const moment = require('moment')
app.engine(
    '.hbs', 
    exphbs.engine({
        extname: '.hbs',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true
        },
        helpers: {
            ifEquals: function (arg1, arg2, options) {
                return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
            },
            timeTill: function (time) {
                return moment(time).fromNow()
            }
        }
    })
)
app.set('view engine', '.hbs');
app.set('views', './views');

// Static folder
const path = require('path')
app.use(express.static('public'))

// Middleware
// const cors = require('cors')
// app.use(cors())
const session = require('express-session')
const MongoStore = require('connect-mongo')
app.use(session({
    secret: 'qwerty',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false } // Remember to set this
}))
app.use(passport.initialize())
app.use(passport.session())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/leaderboards', require('./routes/leaderboards'))

// Connect to DB
const connectDB = require('./config/db')
connectDB().then(() => {
    // Start all leaderboards when db is ready
    const { initContests } = require('./logic/startup')
    initContests()
    console.log("All contests started 🚀")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))