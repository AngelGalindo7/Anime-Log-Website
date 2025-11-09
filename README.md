# Anime-Logger

A web application for discovering, rating, and managing your favorite anime from the MyAnimeList dataset. Create an account, search thousands of anime titles, and build your personal collection with ratings and favorites.

---
## Features

- **User Authentication** – Secure registration and login with bcrypt password hashing
- **Smart Search** – Find anime by name with dynamic search suggestions
- **Detailed Information** – View scores, synopses, episode counts, genres, and more
- **Personal Collection** – Add/remove anime from your favorites list
- **Rating System** – Rate anime from 1-10 and sort by your ratings
- **Responsive Design** – Clean interface with interactive carousel and mobile support
  
---
## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js, Express.js |
| **Frontend** | HTML, CSS, JavaScript, EJS |
| **Database** | MySQL |
| **Data Processing** | Python |
| **Authentication** | Express Sessions + bcrypt |

---

## Dataset

This project uses the [MyAnimeList Dataset (anime-filtered.csv) from Kaggle](https://www.kaggle.com/datasets/dbdmobile/myanimelist-dataset?select=anime-filtered.csv).  

A Python script that creates anime_filtered, users, favorites tables and cleans the data (converts columns to proper types) and inserts it into the anime_filtered MySQL table.  

---
## Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/ce07f064-ecce-4f18-9d8c-24d388165aff" alt="Home Page" width="700" />
  <p><em>Home page with anime carousel and search results with filtering</em></p>
  
  <img src="https://github.com/user-attachments/assets/0f49a201-950f-4737-aa49-963419878c2a" alt="Search Results" width="700" />
  <p><em>Detailed anime information page</em></p>
  
  <img src="https://github.com/user-attachments/assets/44e73d7c-c5f1-42a6-b8e6-a6b10dee5fcb" alt="Anime Details" width="700" />
  <p><em> User's favorited anime list sorted in rating</em></p>
</div>

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or later)
- **MySQL** (v8 or later)

### Installation

#### 1. Clone the Repository
```bash
git clone 
cd Anime-Log-Website
```

#### 2. Install Node.js Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the `src` directory:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=anime_db
```

#### 4. Set Up Python Environment
```bash
# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install python-dotenv mysql-connector-python
```

#### 5. Initialize Database

Run the helper script to create tables and import anime data:
```bash
python helper.py
```

This script will:
- Create the `anime_filtered`, `users`, and `favorites` tables
- Read the CSV file and populate the `anime_filtered` table with cleaned data

#### 6. Start the Application
```bash
npm start
```

The application should now be running at `http://localhost:3000` (or your configured port).

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- [MyAnimeList](https://www.kaggle.com/datasets/azathoth42/myanimelist) for the anime data
- [Kaggle](https://www.kaggle.com/) for hosting the dataset

