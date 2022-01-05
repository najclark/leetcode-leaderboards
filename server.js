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
app.engine('.hbs', exphbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

// Middleware
// const cors = require('cors')
// const bodyParser = require('body-parser')
// require('./auth/google')
// app.use(cors())
// app.use(bodyParser.json())
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


// Static folder
const path = require('path')
app.use(express.static('public'))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

// cookieSession config
const cookieSession = require('cookie-session')
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 2000, // One day in millis
    keys: ['qwerty']
}))

// Connect to DB
const connectDB = require('./config/db')
connectDB()


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))