# Use Node v8 as the base image.
FROM node:8

# create and set app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Run app
CMD ["npm", "start"]