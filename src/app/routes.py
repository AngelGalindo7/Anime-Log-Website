#Looking to add modularity from __init__.py later

# from flask import Blueprint, Flask, jsonify, request, render_template
# from . import create_app

# routes = Blueprint('routes' , __name__)
# print("/")
# @routes.route('/')
# def index():
#     print("FUCK")
#     return render_template("index.html")

# @routes.route('/about')
# def about():
#     return render_template('about.html')

# @routes.route('/create-account')
# def create_account():
#     return render_template('create-account.html')

# @routes.route('/list')
# def list_page():
#     return render_template('list.html')

# @routes.route('/login')
# def login():
#     return render_template('login.html')

# @routes.route('/recommendation')
# def recommendation():
#     print("HI")
#     return render_template('recommendation.html')

# @routes.route('/search')
# def search():
#     # Hardcoded to search for naruto
#     query = 'Naruto'
#     print("SEARCH?")
#     #connect to database
#     conn = mysql.connection
#     cursor = conn.cursor()

#     cursor.execute("SELECT name FROM animes WHERE name LIKE %s", (f"%{query}%",))
    
#     results = cursor.fetchall()
#     cursor.close()
    
#     # Print the results
#     print([row[0] for row in results])
    
#     # Return a simple message indicating that the results were printed
#     return 'Search results for hardcoded query printed to console.'
    
    