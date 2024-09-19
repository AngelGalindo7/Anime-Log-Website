require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');

const saltRounds = 10;

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

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('index', { loggedIn: req.session.loggedIn, username: req.session.username, user_id: req.session.user_id });
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
    if (!req.session.loggedIn) {
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
            return res.redirect('/list');
        }

        // Query to fetch names and sypnopsis based on anime_id
        const dataQuery = 'SELECT anime_id, name, sypnopsis, Episodes, genres FROM anime_filtered WHERE anime_id IN (?)';
        const formattedDataQuery = mysql.format(dataQuery, [animeIds]);

        db.query(formattedDataQuery, (err, DataResults) => {
            if (err) {
                console.error('Error fetching anime names:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Store the list of names in session
            req.session.listData = DataResults;
            res.redirect('/list');
        });

    });
});

app.get('/list', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'list.html'));
    //res.render('index', { title: 'IM AT THE LIST PAGE' });
});

//TODO: Change name to fetch
app.get('/get-list-data', (req, res) => {
    // Retrieve data from session
    const listData = req.session.listData || [];
    // Send data as JSON
    res.json(req.session.listData || []);
})

app.get('/get-rating', (req, res) => {
    const anime_id = req.query.anime_id;
    const user_id = req.session.user_id;

    const query = 'SELECT rating FROM favorites WHERE uuid = ? AND anime_id = ?';
    const formattedQuery = mysql.format(query, [user_id, anime_id]);

    db.query(formattedQuery, (err, results) => {
        if (err) {
            console.error('Error retrieving rating:', err);
            return res.status(500).send('Error retrieving rating');
        }

        res.json({ rating: results.length > 0 ? results[0].rating : null });
    });
});


app.get('/go-to-anime/:anime_id', (req,res) => {
    const anime_id = req.params.anime_id;
    const user_id = req.session.user_id;
    const query = 'SELECT Name, Score, Genres, sypnopsis, Type, Episodes, anime_id, Aired, Studios FROM anime_filtered WHERE anime_id = ?';
    const formattedQuery = mysql.format(query, [anime_id]);

    db.query(formattedQuery, (err, results) => {
        if(err) {
            console.log('Error retrieving rating:', err);
            return res.status(500).send('Error retrieving rating');
        }
        if (results.length > 0) {
            // Send the first row's details (assuming anime_id is unique)
            res.render('anime-info-template', { anime: results[0] });
        } else {
            res.render('anime-info-template', { anime: null });
        }
    });

});


app.post('/save-rating', (req, res) => {
    const { anime_id, rating } = req.body;
    const user_id = req.session.user_id;

    //console.log('Saving rating for user:', user_id, 'anime:', anime_id, 'rating:', rating);

    const query = `
        INSERT INTO favorites (uuid, anime_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ?;
    `;
    const formattedQuery = mysql.format(query, [user_id, anime_id, rating, rating]);

    db.query(formattedQuery, (err, result) => {
        if (err) {
            console.error('Error saving rating:', err);
            return res.status(500).send('Error saving rating');
        }

        res.status(200).send('Rating saved successfully');
    });
});


app.get('/login', (reg, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
}); 

app.get('/test', (req, res) => {
    res.send('Test route is working!');
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
})


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const email_query = 'SELECT * FROM users WHERE email = ?';
    const formatted_email_Query = mysql.format(email_query, [email]);

    db.query(formatted_email_Query, (err, email_results) => {
        if (err) {
            console.error('Error checking for existing email:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (email_results.length !== 1) {
            return res.status(400).json({ error: 'Account does not exist!' });
        }

        const hashedPassword = email_results[0].password;

        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!isMatch) {
                return res.status(400).json({ error: 'Incorrect Password!' });
            }

            req.session.loggedIn = true;
            req.session.user_id = email_results[0].id;
            req.session.username = email_results[0].username;

            if (req.session.listhi === true) {
                req.session.listhi = false;
                return res.status(200).json({ redirect: '/fetch-list-data' });
            } else {
                return res.status(200).json({ redirect: '/' });
            }
        });
    });
});

app.get('/check-auth', (req, res) => {
    res.json({
        loggedIn: req.session.loggedIn || false,
        username: req.session.username || '', 
        user_id: req.session.user_id || 0
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

        // Hash the password before storing it in the database
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Insert user data into the database with the hashed password
            const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            const formattedQuery = mysql.format(query, [username, email, hash]);

            db.query(formattedQuery, (err, result) => {
                if (err) {
                    console.error('Error inserting user data:', err);
                    return res.status(500).send('Error creating account');
                }
                res.redirect('/');
            });
        });
    });
});


app.post('/search', (req, res) => {
    const searchQuery = req.body.search;
    const user_id = req.session.user_id;

    const searchQueryText = 'SELECT name, anime_id FROM anime_filtered WHERE name LIKE ? OR English_name LIKE ? ORDER BY Popularity ASC LIMIT 5';
    const searchQueryFormatted = mysql.format(searchQueryText, [`%${searchQuery}%`, `%${searchQuery}%`]);

    db.query(searchQueryFormatted, (err, results) => {
        if (err) {
            console.error('Error executing search query:', err);
            return res.status(500).send('500 - Internal Server Error');
        }

        if (results.length > 0) {
            const animeIds = results.map(anime => anime.anime_id);
            const favoritesQueryText = 'SELECT anime_id FROM favorites WHERE uuid = ? AND anime_id IN (?)';
            const favoritesQueryFormatted = mysql.format(favoritesQueryText, [user_id, animeIds]);

            db.query(favoritesQueryFormatted, (favErr, favoriteResults) => {
                if (favErr) {
                    console.error('Error checking favorites:', favErr);
                    return res.status(500).send('500 - Internal Server Error');
                }

                const favoriteAnimeIds = new Set(favoriteResults.map(fav => fav.anime_id));

                const enrichedResults = results.map(anime => ({
                    ...anime,
                    isFavorited: favoriteAnimeIds.has(anime.anime_id)
                }));

                res.json({ results: enrichedResults });
            });
        } else {
            res.json({ results: [] });
        }
    });
});

// adding to list (favoriting the anime)
app.post('/favorite', (req, res) => {
    const anime_id = req.body.anime_id;
    const user_id = req.session.user_id;

    const checkFavoriteQuery = 'SELECT * FROM favorites WHERE uuid = ? AND anime_id = ?';
    const checkFavoriteFormatted = mysql.format(checkFavoriteQuery, [user_id, anime_id]);

    db.query(checkFavoriteFormatted, (err, results) => {
        if (err) {
            console.error('Error checking favorite:', err);
            return res.status(500).send('500 - Internal Server Error');
        }

        if (results.length > 0) {
            // If already favorited, unfavorite it
            const deleteFavoriteQuery = 'DELETE FROM favorites WHERE uuid = ? AND anime_id = ?';
            const deleteFavoriteFormatted = mysql.format(deleteFavoriteQuery, [user_id, anime_id]);

            db.query(deleteFavoriteFormatted, (deleteErr, deleteResult) => {
                if (deleteErr) {
                    console.error('Error deleting favorite:', deleteErr);
                    return res.status(500).send('500 - Internal Server Error');
                }

                res.status(200).send({ message: 'Anime unfavorited successfully!', action: 'unfavorited' });
            });
        } else {
            // If not favorited, favorite it
            const insertFavoriteQuery = 'INSERT INTO favorites (uuid, anime_id) VALUES (?, ?)';
            const insertFavoriteFormatted = mysql.format(insertFavoriteQuery, [user_id, anime_id]);

            db.query(insertFavoriteFormatted, (insertErr, insertResult) => {
                if (insertErr) {
                    console.error('Error adding favorite:', insertErr);
                    return res.status(500).send('500 - Internal Server Error');
                }

                res.status(200).send({ message: 'Anime favorited successfully!', action: 'favorited' });
            });
        }
    });
});

app.get('/get-favorites', (req, res) => {
    // Assuming req.session.userId contains the logged-in user's ID
    const userId = req.session.user_id; // Adjust as per your session handling

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const sql = 'SELECT anime_id FROM favorites WHERE uuid = ?';
    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Extract anime IDs from the query result
        const favoriteAnimeIds = results.map(row => row.anime_id);
        res.json({ favoriteAnimeIds });
    });
});

// app.post('/run-script', (req, res) => {
//     exec('python src/load_model.py', (error, stdout, stderr) => {
//         if (error) {
//             return res.status(500).json({ error: error.message });
//         }
//         if (stderr) {
//             return res.status(400).json({ error: stderr });
//         }
//         res.json({ output: stdout });
//     });
// });

app.post('/run-script', (req, res) => {
    const scriptPath = path.join(__dirname, 'load_model.py');
    
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            return res.status(400).json({ error: stderr });
        }
        res.json({ output: stdout });
    });
})

// Handle all other routes
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});