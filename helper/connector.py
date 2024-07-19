import csv
import mysql.connector
# python3 -m pip install mysql-connector-python
# MySQL connection parameters
cnx = mysql.connector.connect(user='friend', password='hi', host='76.133.198.181', database='new_schema')
cursor = cnx.cursor()

# CSV file path
csv_file_path = 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\anime-filtered.csv'

with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)  # Skip the header row
    for row in reader:
        cursor.execute("INSERT INTO anime_filtered (anime_id, Name, Score, Genres, English_name, Japanese_name, sypnopsis, Type, \
                       Episodes, Aired, Premiered, Producers, Licensors, Studios, Source, Duration, Rating, Ranked, Popularity, \
                       Members, Favorites, Watching, Completed, On_Hold, Dropped) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, \
                       %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", row)

cnx.commit()
cursor.close()
cnx.close()