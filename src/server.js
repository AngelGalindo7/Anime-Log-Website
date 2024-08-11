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

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('index', { loggedIn: req.session.loggedIn, username: req.session.username, user_id:req.session.id });
});

app.get('/recommendation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recommendation.html'));
    //res.render('index', { title: 'IM AT THE RECOMMENDATION PAGE' });
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
    //res.render('index', { title: 'IM AT THE ABOUT PAGE' });
});

app.get('/fetch-list-data', (req, res) => {
    console.log("Fetching list data...");
    if (!req.session.loggedIn) {
        console.log("Not logged in, redirecting to login...");
        req.session.listhi = true;
        return res.redirect('/login');
    }

    const user_id = req.session.user_id;
    const query = 'SELECT anime_id FROM favorites WHERE uuid = ?';
    const formattedQuery = mysql.format(query, [user_id]);

    db.query(formattedQuery, (err, results) => {
        if (err) {
            console.error('Error fetching favorite list data:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Extract anime_id values
        const animeIds = results.map(row => row.anime_id);
        if (animeIds.length === 0) {
            req.session.listData = [];
            console.log('No favorite anime found.');
            return res.redirect('/list');
        }

        // Query to fetch names based on anime_id
        const nameQuery = 'SELECT anime_id, name FROM anime_filtered WHERE anime_id IN (?)';
        const formattedNameQuery = mysql.format(nameQuery, [animeIds]);

        db.query(formattedNameQuery, (err, nameResults) => {
            if (err) {
                console.error('Error fetching anime names:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Store the list of names in session
            req.session.listData = nameResults;
            res.redirect('/list');
        });
    });
});

app.get('/list', (req, res) => {
    console.log("PRINT");
    res.sendFile(path.join(__dirname, 'public', 'list.html'));
    //res.render('index', { title: 'IM AT THE LIST PAGE' });
});

app.get('/get-list-data', (req, res) => {
    console.log("HEY");
    // Retrieve data from session
    const listData = req.session.listData || [];
    console.log(req.session.listData);
    // Send data as JSON
    res.json(req.session.listData || []);
})

app.get('/login', (reg, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
}); 

app.get('/test', (req, res) => {
    console.log('Received request for /test');
    res.send('Test route is working!');
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
})


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

            req.session.loggedIn = true; 
            req.session.user_id = login_results[0].id;
            req.session.username = login_results[0].username;

            if(req.session.listhi === true){
                console.log
                req.session.listhi = false;
                res.redirect('/fetch-list-data');
            }
            else{
            res.redirect('/');
            }
        })
    })      
});

app.get('/check-auth', (req, res) => {
    res.json({
        loggedIn: req.session.loggedIn || false,
        username: req.session.username || ''
    });
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/'); // Redirect to the main page
    });
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

    const query = 'SELECT name, anime_id FROM anime_filtered WHERE name LIKE ? OR English_name LIKE ? ORDER BY Popularity ASC LIMIT 5';
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

// adding to list (favoriting the anime)
app.post('/favorite', (req, res) => {
    const anime_id = req.body.anime_id;
    const user_id = req.session.user_id;
    console.log(user_id);

    const query = 'INSERT INTO favorites (uuid, anime_id) VALUES (? , ?)';
    const formattedQuery = mysql.format(query, [`${user_id}`, `${anime_id}`]);

    db.query(formattedQuery, (err, result) => {
        if (err) {
            console.error('Error inserting into id:', err);
            return res.status(500).send('Error adding favorite');
        }

        console.log('Anime added to favorites:', result);
        res.status(200).send('Anime favorited successfully!');
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