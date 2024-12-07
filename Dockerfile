# Use Node.js LTS version as the base image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy public directory (without sw.js)
COPY public/ ./public/

# Copy server files and PWA files
COPY server.js .
COPY manifest.json .
COPY sw.js .

# Create necessary directories and set permissions
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
