# Fetching the latest node image on alpine linux
FROM node:alpine AS development

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /innoscripta-case-study

# Installing dependencies
COPY ./package*.json /innoscripta-case-study

RUN npm install

# Copying all the files in our project
COPY . .

# Starting our application
CMD ["npm","start"]