FROM node:18-alpine

# Install curl and wget for health checks
RUN apk add --no-cache curl wget

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY . ./

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
