require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');

// Create an Express application
const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL');
});

// Set up session middleware
app.use(session({
    secret: 'your_secret_key', // Change this to a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('index', { loggedIn: req.session.loggedIn });
});

app.get('/recommendation', (req, res) => {
    //res.sendFile(path.join(__dirname, 'public', 'recommendation.html'));
    res.render('index', { title: 'IM AT THE RECOMMENDATION PAGE' });
});

app.get('/about', (req, res) => {
    res.render('index', { title: 'IM AT THE ABOUT PAGE' });
});

app.get('/list', (req, res) => {
    res.render('index', { title: 'IM AT THE LIST PAGE' });
});

app.get('/login', (reg, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
    //res.render('index', {title: 'IM AT THE LOGIN PAGE'});
});

// Handle /recommendation route
// app.get('/api/recommendation', (req, res) => {
//     console.log('Received request for /recommendation');
//     const queryString = `SELECT name FROM anime_filtered ORDER BY Popularity LIMIT 20`;

//     db.query(queryString, (err, results) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('500 - Internal Server Error');
//             return;
//         }

//         // Print results to the terminal
//         console.log('Query Results:', results);

//         res.json(results);
//     });
// });

app.get('/test', (req, res) => {
    console.log('Received request for /test');
    res.send('Test route is working!');
});


app.post('/login', (req, res) => {

    const {email, password} = req.body;

    //Check if emails equal
    const email_query = 'SELECT * FROM users WHERE email = ?';
    const formatted_email_Query = mysql.format(email_query, [email]);

    db.query(formatted_email_Query, (err, email_results) => {
        if (err) {
            console.error('Error checking for existing email:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (email_results.length != 1) {
            // User with the same username or email already exists
            return res.status(400).send('Account does not exist !');
        }

        //Check if passwords equal
        const login_query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const formatted_login_Query = mysql.format(login_query, [email, password]);

        db.query(formatted_login_Query, (err, login_results) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }

            if (login_results.length != 1) {
                // Password doesn't match
                return res.status(400).send('Incorrect Password!');
            }
            res.status(200).send("Return to Main Page GOODJOBB");
            //TODO: If logged in, loggedIn variable is set to true
            req.session.loggedIn = true; // Set session variable
            //res.redirect('/');
        })
})

        
});


app.get('/create-account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-account.html'));
});

app.post('/create-account', (req, res) => {
    const { username, email, password, 'confirm-password': confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match!');
    }

    // Check for existing username or email
    const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const formattedCheckQuery = mysql.format(checkQuery, [username, email]);

    db.query(formattedCheckQuery, (err, results) => {
        if (err) {
            console.error('Error checking for existing user:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            // User with the same username or email already exists
            return res.status(400).send('Username or email already exists!');
        }

        // Insert user data into the database
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const formattedQuery = mysql.format(query, [username, email, password]);

        db.query(formattedQuery, (err, result) => {
            if (err) {
                console.error('Error inserting user data:', err);
                return res.status(500).send('Error creating account');
            }

            console.log('User data inserted successfully:', result);
            res.status(200).send('Account created successfully!');
        });
    });
});


app.post('/search', (req, res) => {
    const searchQuery = req.body.search;

    const query = 'SELECT name FROM anime_filtered WHERE name LIKE ? OR English_name LIKE ? ORDER BY Popularity ASC LIMIT 5';
    const formattedQuery = mysql.format(query, [`%${searchQuery}%`, `%${searchQuery}%`]);

    db.query(formattedQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('500 - Internal Server Error');
            return;
        }

        res.json({results});
    });
});

// Handle all other routes
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
