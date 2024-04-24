# Boulder County Nature Association Project

---

## Table of Contents

- [Summary](#summary)
- [Running The App Locally](#running-the-app-locally)
- [Contributing Code](#contributing-code)

## Summary
This project composes of two main components: a wildlife search engine that can sort and filter results based on various attributes such as name, color, and habitat, and an administrative platform to add, edit, and delete data.

The goal is for people to be able to learn more about the local wildlife in Boulder County, but the technology can be adapted to wildlife anywhere. Our database is structured into categories, and each wildlife entry belongs to a category. Categories contain fields which organize relevant information for each category of animals, whether that be wingspan for birds or favorite food for bears. 

More information can be found in the [More Details Section](#more-details)

## Running The App Locally

#### Frontend

- Start from the root directory of the project
- Run `cd frontend` in your terminal
- Run `npm i` to install frontend packages like TailwindCSS
- Run `npm start` and the app should now be running on `localhost:3000`
- NOTE: you will NOT see any data from the database unless you also follow steps to run the backend

#### Backend

- Start from the root directory of the project
- Run `cd backend` in your terminal (you may need to create a new terminal if you're also running the frontend)
- (Only on the first time) Run `python3.12 -m venv venv` to create the Python virtual environment. If this fails, you need to [install Python 3.12](https://www.python.org/downloads/). 
- Run `source venv/bin/activate` to activate the virtual environment.
- (Only on the first time) Run `pip install -r requirements.txt` to install the necessary libraries.
- Run `python3 main.py` which will create the database for you the first time it runs, and then host the backend at `http://127.0.0.1:5000`
- *Optional:* Run `sqlite3 database.db` in a new terminal form the `backend` folder if you'd like to check the database has the data you expect as you interact with API routes. You may need to run `source venv/bin/activate` again.



## Contributing Code
- To start, clone the repository onto your local machine. 
- If you already have the repo but haven't updated in a while, make sure to run `git pull origin main` to get the latest changes to main before creating a new branch
- Create your branch with `git checkout -b branch-name` , replacing branch name with your name and what you're working on
- Run the relevant parts of [Running The App Locally](#running-the-app-locally) if you need to see live changes
- After you've changed the code, run the following commands
	- `git add file-1-here file-2-here` or just `git add .`
	- `git status` to ensure that you added the correct files to be committed
	- `git commit -m 'what i did in this commit'`
	- `git push`

Once your code is pushed to your remote branch, you can open a pull request. 
- Navigate to the `Pull Requests` tab at the top of the repository
- Press the green `New pull request` button
- Ensure that `base: main` is selected and `compare: your-branch` is selected
- Press the green `Create pull request` button
- After review, you can approve and merge the pull request into main
- Optionally, you can delete your branch if you were just using it for one feature and it is no longer needed

## More Details

Categories are hierarchal such that you can have a category like "Animals" which contains subcategories like "Mammals, Birds," etc depending on how you want to organize the data. Fields will be inherited from parent categories so that all categories of butterflies can share the same fields.

Our technology stack includes...
- **ReactJS** for Frontend components and pages
- **TailwindCSS** for styling our website
- **Flask** for handling our API routes and backend code
- **SQLite** as our SQL database
