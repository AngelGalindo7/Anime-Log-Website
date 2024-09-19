import pandas as pd
from fastai.collab import *
from fastai.tabular.all import *
from fastai.data.transforms import RandomSplitter
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import mysql.connector
from dotenv import load_dotenv
import torch

# Define sigmoid_range before the class
def sigmoid_range(x, low, high):
    """Scale the sigmoid output to a specific range (low, high)."""
    return torch.sigmoid(x) * (high - low) + low

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

# Create a connection to the MySQL database
conn = mysql.connector.connect(**db_config)
query = 'SELECT * FROM your_table'

ratings = pd.read_sql(query, conn)


path = "datasets/users-score-2023.csv" 

ratings = pd.read_csv(path)

ratings = ratings.drop('Username', axis=1)
user_threshold = 10  # Example: Users with at least 10 ratings
anime_threshold = 5000  # Example: Anime with at least 50 ratings

# Get counts
user_counts = ratings['user_id'].value_counts()
anime_counts = ratings['Anime Title'].value_counts()

# Filter users and anime based on thresholds
filtered_users = user_counts[user_counts > user_threshold].index
filtered_animes = anime_counts[anime_counts > anime_threshold].index

# Filter the original DataFrame
filtered_ratings = ratings[ratings['user_id'].isin(filtered_users) & ratings['Anime Title'].isin(filtered_animes)]

filtered_ratings = filtered_ratings.drop('anime_id', axis=1)

# DataLoaders setup
dls = CollabDataLoaders.from_df(filtered_ratings, item_name='Anime Title', bs=64, num_workers=4)

n_users = len(dls.classes['user_id'])
n_animes = len(dls.classes['Anime Title'])
n_factors = 5

# Define helper function to create model parameters
def create_params(size):
    return nn.Parameter(torch.zeros(*size).normal_(0, 0.1))

# Define the model
class DotProductBias(Module):
    def __init__(self, n_users, n_animes, n_factors, y_range=(0, 10.5)):
        self.user_factors = create_params([n_users, n_factors])
        self.user_bias = create_params([n_users])
        self.movie_factors = create_params([n_animes, n_factors])
        self.movie_bias = create_params([n_animes])
        self.y_range = y_range
    
    def forward(self, x):
        users = self.user_factors[x[:, 0]]
        movies = self.movie_factors[x[:, 1]]
        res = (users * movies).sum(dim=1)
        res += self.user_bias[x[:, 0]] + self.movie_bias[x[:, 1]]
        return sigmoid_range(res, *self.y_range)
