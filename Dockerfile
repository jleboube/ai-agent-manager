# Multi-stage build for React/Vite application

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Accept build argument for API key
ARG VITE_API_KEY

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm install since no package-lock.json exists
RUN npm install

# Copy source code
COPY . .

# Build the application with the API key embedded
ENV VITE_API_KEY=${VITE_API_KEY}
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
