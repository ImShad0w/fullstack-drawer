# Fullstack collab canva with rooms

Fun app that let's users paint on the same canvas in real time!

## Technologies used

- Vue 3
- Vite
- Socket.IO
- Node.js
- Express.js

# Setting up for development

You have the choice between doing it manually or automated by docker

# Automated setup
For the automated setup we have created a docker-compose.yml

## Run docker-compose for dev

```sh
docker-compose up -d
```

Or if you have another docker setup:

```sh
docker compose up -d
```

This part will be for those who prefer manual setup

# Manual setup

## Frontend setup
```sh
cd frontend
npm install
npm run dev
```
Note: The frontend server will be at: `http://localhost:5173`

## Backend setup

```sh
cd backend
npm install
node server.js
```
Note: The backend server will listen to the following adress: `http://localhost:3000`

You're completely free to change the server port, of the backend or of the frontend to which you prefer


# Setting up for production

For production on the other hand you need to do the following:

## Minimize and build frontend for production

```sh
cd frontend
npm run build
```
The source files will now be available at: `frontend/dist`

## Run node server

You can see in the configuration that you just need to get your server up and running, since it's already listening for the `dist` folder

```sh
cd backend
node server.js
```

Then go to `http:localhost:3000` or whatever port you're using and you can see the changes in production as well.
