# Use Ubuntu as base image
FROM ubuntu:focal

# Install dependencies and clean up cache in one layer
RUN apt-get update && \
    apt-get install -y curl gnupg ffmpeg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install dependencies (package.json only)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose server port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
