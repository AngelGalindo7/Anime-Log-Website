from flask import Flask,render_template, jsonify, request
from flask_mysqldb import MySQL
import mysql.connector
#from flask_sqlalchemy import SQLAlchemy

from . import config


def create_app():
    app = Flask(__name__)
    # Load configuration
    #app.config.from_object(config)
    app.config['MYSQL_HOST'] = ''
    app.config['MYSQL_USER'] = ''
    app.config['MYSQL_PASSWORD'] = ''
    app.config['MYSQL_DB'] = 'new_schema'
    # Initialize MySQL
    mysql = MySQL(app)

    '''from .routes import routes
    app.register_blueprint(routes)
    '''
    
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/about')
    def about():
        return render_template('about.html')

    @app.route('/create-account')
    def create_account():
        return render_template('create-account.html')

    @app.route('/list')
    def list_page():
        return render_template('list.html')

    @app.route('/login')
    def login():
        return render_template('login.html')

    @app.route('/recommendation')
    #GET
    def recommendation():
        # Hardcoded to search for naruto
        query = 'Bocchi'
        print("SEARCH?")
        #connect to database
        conn = mysql.connection
        cursor = conn.cursor()
        
        #SQL INJECTION PREVENTION ATTENTIONO RETENTION
        #connection.execute('INSERT INTO person (name, age) VALUES (?, ? );'')
        
        cursor.execute("SELECT name FROM anime_filtered WHERE name LIKE %s order by Popularity limit 20", (f"%{query}%",))

        results = cursor.fetchall()
        cursor.close()
        
        # Print the results
        print([row[0] for row in results])
        
        return render_template('recommendation.html')
    
    
    @app.route('/search')
    def search():
    # Hardcoded to search for naruto
        query = 'Naruto'
        print("SEARCH?")
        #connect to database
        conn = mysql.connection
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM animes WHERE name LIKE %s", (f"%{query}%",))

        results = cursor.fetchall()
        cursor.close()

        # Print the results
        print([row[0] for row in results])

        # Return a simple message indicating that the results were printed
        return 'Search results for hardcoded query printed to console.'
    # Make mysql available for other modules
    app.mysql = mysql

    return app
