from flask import Flask,render_template, jsonify, request
from flask_mysqldb import MySQL


def create_app():
    app = Flask(__name__)
    # Load configuration
    app.config.from_object('src.app.config')

    # Initialize MySQL
    mysql = MySQL(app)

    from .routes import routes
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
    def recommendation():
        return render_template('recommendation.html')
    '''
    # Make mysql available for other modules
    app.mysql = mysql

    return app
