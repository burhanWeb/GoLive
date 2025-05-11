# Use Ubuntu as base image
FROM ubuntu:focal

# Install dependencies and clean up cache in one layer
RUN apt-get update && \
    apt-get install -y curl gnupg ffmpeg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json before installing dependencies
COPY package.json package-lock.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .


RUN npm ci --only=production



# Command to run the server with nodemon
CMD ["node", "server.js"]

# Expose the port the app runs on
EXPOSE 3000
