# Multi-stage build for React/Vite application

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:3001/api

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application with the API URL embedded
ENV VITE_API_URL=${VITE_API_URL}
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
