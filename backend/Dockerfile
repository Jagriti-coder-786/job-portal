FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose API port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
