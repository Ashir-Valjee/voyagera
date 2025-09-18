#Voyagera

# Setup intructions

1. **Clone the repository**
```bash
git clone https://github.com/Ashir-Valjee/voyagera.git
```

2. **Create your .env file**

This application requires environment variables to be configured before running.

Follow these steps to set up your development environment:

- In the backend directory of the project create a file called `.env`:
```bash
touch .env
```

3. **Set up the virtual environment**
```bash
python -m venv .venv
```
4. **Activate the virtual environment**
```bash
source .venv/bin/activate
```
5. **Install python dependencies in backend directory**
```bash
(.venv) pip install -r requirements.txt
```
6. **Create a development database**
```bash
(.venv) createdb voyagera

```
7. **Run database migrations:**
- Django uses migrations to seed the database, so no need for seed.sql files!
    - The same goes for all testing, and Django even makes its own DB copy for testing each time - helpful!
    - Find out more [about django migrations and the ORM here](./docs/database_migrations_vs_seeds.md)

```bash
cd backend
# you should be in the same folder as manage.py run ls to check
python manage.py migrate
```
8. **Start the applications**

**Start the Django backend server:**
```bash
cd backend
python manage.py runserver
```

9. **Visit the application**
- Backend API: http://localhost:8000/api
- Frontend: http://localhost:5174