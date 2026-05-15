# Fetching the latest node image on alpine linux
FROM node:20-alpine

# Setting up the work directory
WORKDIR /app

# Installing dependencies
COPY package*.json .

RUN npm install

# Copying all the files in our project
COPY . .

EXPOSE 5173
# Starting our application
CMD ["npm","run","dev"]