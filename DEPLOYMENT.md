# Deployment Guide

This guide covers different deployment options for the Bash Terminal Simulator.

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/bash-terminal-simulator.git
cd bash-terminal-simulator

# Install dependencies
npm run install-all

# Start development server
npm run dev
```

Access the application at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Production Deployment

### Option 1: Traditional VPS/Server

#### Prerequisites
- Ubuntu 20.04+ or CentOS 7+
- Node.js (v14 or higher)
- PM2 (for process management)
- Nginx (for reverse proxy)

#### Steps

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone and setup the application**
   ```bash
   git clone https://github.com/yourusername/bash-terminal-simulator.git
   cd bash-terminal-simulator
   npm run install-all
   npm run build
   ```

4. **Create PM2 ecosystem file**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'bash-terminal-simulator',
       script: 'server/index.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   };
   ```

5. **Start the application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker Deployment

#### Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm run install-all

# Copy source code
COPY . .

# Build client
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

#### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Deployment

#### Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Add buildpacks**
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Select the main branch
3. Set build command: `npm run build`
4. Set run command: `npm start`
5. Configure environment variables
6. Deploy

#### AWS EC2

1. Launch an EC2 instance (Ubuntu 20.04)
2. Install Node.js and PM2
3. Clone and setup the application
4. Configure security groups (port 80, 443)
5. Set up SSL with Let's Encrypt
6. Configure domain DNS

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=./data/database.sqlite
```

## Database Setup

The application uses SQLite by default. For production, consider:

- **PostgreSQL**: For better performance and scalability
- **MySQL**: Alternative relational database
- **MongoDB**: For document-based storage

### PostgreSQL Setup

1. Install PostgreSQL
2. Create database and user
3. Update database configuration
4. Run migrations

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart bash-terminal-simulator
```

### Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/bash-terminal-simulator
```

## Backup Strategy

### Database Backup
```bash
# SQLite backup
cp data/database.sqlite backups/database-$(date +%Y%m%d).sqlite

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp data/database.sqlite backups/database-$DATE.sqlite
find backups/ -name "database-*.sqlite" -mtime +7 -delete
```

## Security Considerations

1. **Change default admin password**
2. **Use strong JWT secrets**
3. **Enable HTTPS**
4. **Regular security updates**
5. **Firewall configuration**
6. **Database encryption**
7. **Input validation**
8. **Rate limiting**

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 PID
   ```

2. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   ```

3. **Database locked**
   ```bash
   # Check for running processes
   ps aux | grep node
   # Kill processes if needed
   ```

### Logs Location
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Performance Optimization

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Database indexing**
4. **Caching strategies**
5. **Load balancing**
6. **Resource monitoring**

## Scaling

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple application instances
- Database clustering
- Session management

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Memory optimization
- CPU optimization
