from fastai.vision.all import *
from fastai.tabular.all import *
from custom import DotProductBias, filtered_ratings, n_animes, create_params, sigmoid_range

learn_inf = load_learner('export2024-09-17-05-59-47.pk1')

def get_rated_animes(user_id, filtered_ratings):
    rated_animes = filtered_ratings[filtered_ratings['user_id'] == user_id]['Anime Title'].tolist()
    return rated_animes

def get_unwatched_animes(user_id, filtered_ratings):
    # Get all movies the user has rated
    watched_animes = get_rated_animes(user_id, filtered_ratings)
    
    # Get all movie titles
    all_titles = filtered_ratings['Anime Title'].tolist()
    
    # Get the unwatched movies
    unwatched_animes = list(set(all_titles) - set(watched_animes))
    
    return unwatched_animes


def predict_ratings_for_unwatched(user_id, unwatched_animes, learn, anime_to_idx):
    valid_animes = []
    for anime in unwatched_animes:
        if anime in anime_to_idx:
            valid_animes.append(anime)
        else:
            pass
            # print(f"Anime '{anime}' not found in the index and will be skipped.")
    
    if len(valid_animes) == 0:
        print("No valid animes found for this user.")
        return []

    user_tensor = torch.tensor([user_id] * len(valid_animes))
    anime_tensor = torch.tensor([anime_to_idx[anime] for anime in valid_animes])
    
    user_anime_tensor = torch.stack([user_tensor, anime_tensor], dim=1)
    
    # Predict ratings
    predicted_ratings = learn.model(user_anime_tensor)

    return list(zip(valid_animes, predicted_ratings.tolist()))

def get_top_recommendations(user_id, filtered_ratings, learn, anime_to_idx, top_n=10):
    unwatched_animes = get_unwatched_animes(user_id, filtered_ratings)
    
    predicted_ratings = predict_ratings_for_unwatched(user_id, unwatched_animes, learn, anime_to_idx)
    
    # Step 3: Sort anime by predicted rating
    predicted_ratings.sort(key=lambda x: x[1], reverse=True)
    
    # Step 4: Return top-N recommendations
    return predicted_ratings[:top_n]

user_id = 13  # Replace with the actual user_id
anime_to_idx = {v: k for k, v in enumerate(learn_inf.dls.classes['Anime Title'])}

# Get the top 10 recommendations for the user
recommendations = get_top_recommendations(user_id, filtered_ratings, learn_inf, anime_to_idx, top_n=10)

# Display the recommendations
for movie, rating in recommendations:
    print(f"Movie: {movie}, Predicted Rating: {rating:.2f}")
