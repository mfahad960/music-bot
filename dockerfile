# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the bot's code
COPY . .

# Command to run the bot
CMD ["node", "index.js"]
