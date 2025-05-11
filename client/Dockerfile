# Use Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

# Expose the port that the app will run on
EXPOSE 3000

# Set the default command to start the server, updating the path to 'server/server.js'
CMD ["npm", "run", "dev"]
