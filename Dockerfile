# ---- Base Stage ----
# Use a specific Node.js version for consistency
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- Build Stage ----
# Build the React application
FROM base AS builder
COPY . .
# The VITE_API_BASE environment variable is set here to ensure the production
# build of the frontend knows to make API calls to the relative path '/api'.
# This is crucial for the proxy setup to work.
RUN npm run build -- --base=/

# ---- Production Stage ----
# Use a lightweight Nginx server to serve the static files
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
# Remove the default Nginx content
RUN rm -rf ./*
# Copy the built assets from the builder stage
COPY --from=builder /app/dist .
# Copy a custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]