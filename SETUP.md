# MailFloww Setup Guide

## Prerequisites

Before setting up MailFloww, ensure you have the following:

### System Requirements
- Python 3.8 or higher
- Node.js 16 or higher
- Git
- 8GB RAM minimum (16GB recommended)
- NVIDIA GPU with 4GB+ VRAM (optional, for acceleration)

### API Keys Required
You'll need to obtain the following API keys:

1. **Groq API Key**
   - Visit: https://console.groq.com/
   - Sign up for an account
   - Generate an API key

2. **LangSmith API Key** (optional, for monitoring)
   - Visit: https://smith.langchain.com/
   - Create an account
   - Generate an API key

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/mailfloww.git
cd mailfloww
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```

### 4. LangGraph Service Setup
```bash
cd ../langgraph-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure the service
cp config.py.example config.py
```

### 5. Configuration

Edit `langgraph-service/config.py` and update the following:

```python
# Required: Add your Groq API key
GROQ_API_KEY = "your_actual_groq_api_key_here"

# Optional: Add LangSmith for monitoring
LANGCHAIN_API_KEY = "your_actual_langsmith_api_key_here"
LANGCHAIN_PROJECT = "your_project_name"

# Optional: Configure database
DATABASE_URL = "postgresql://username:password@localhost:5432/mailfloww"
```

### 6. Database Setup (Optional)

If using PostgreSQL:
```bash
# Install PostgreSQL
# Create database
createdb mailfloww

# Update DATABASE_URL in config.py
```

### 7. Gmail API Setup (Optional)

For Gmail integration:
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Gmail API
4. Create credentials (OAuth 2.0)
5. Download credentials.json
6. Update GMAIL_CREDENTIALS_FILE path in config.py

## Running the Application

### Start All Services

1. **Start Backend** (Terminal 1):
```bash
cd Backend
npm start
```

2. **Start LangGraph Service** (Terminal 2):
```bash
cd langgraph-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

3. **Start Frontend** (Terminal 3):
```bash
cd Frontend
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **LangGraph Service**: http://localhost:8000
- **Health Check**: http://localhost:4000/health

## Verification

### Test the Setup

1. Open http://localhost:3000 in your browser
2. You should see the MailFloww interface
3. Try generating a test email response
4. Check the console logs for any errors

### Health Checks

```bash
# Check Backend
curl http://localhost:4000/health

# Check LangGraph Service
curl http://localhost:8000/health
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change ports in respective configuration files
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

2. **GPU Not Detected**
   - Set `USE_GPU = False` in config.py
   - Install CUDA toolkit if you have NVIDIA GPU

3. **API Key Errors**
   - Verify API keys are correct
   - Check API key permissions and quotas

4. **Module Not Found**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

5. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

### Getting Help

- Check the main README.md for detailed documentation
- Review logs in each service terminal
- Ensure all prerequisites are installed
- Verify all configuration values

## Development Mode

For development with auto-reload:

```bash
# Backend with nodemon
cd Backend
npm run dev

# Frontend with hot reload
cd Frontend
npm start

# LangGraph with auto-reload
cd langgraph-service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Production Deployment

For production deployment, consider:

1. Use environment variables for sensitive configuration
2. Set up proper logging and monitoring
3. Configure reverse proxy (nginx)
4. Use process managers (PM2, systemd)
5. Set up SSL certificates
6. Configure database backups
7. Monitor resource usage

## Security Configuration

### Frontend Security Setup

1. **AWS Cognito Configuration**:
   ```bash
   # Copy environment template
   cp Frontend/.env.example Frontend/.env.local

   # Edit Frontend/.env.local with your AWS Cognito details:
   REACT_APP_AWS_REGION=your-aws-region
   REACT_APP_COGNITO_USER_POOL_ID=your-user-pool-id
   REACT_APP_COGNITO_CLIENT_ID=your-client-id
   REACT_APP_COGNITO_CLIENT_SECRET=your-client-secret
   ```

2. **Update AWS Configuration Files**:
   - Edit `Frontend/src/amplifyconfiguration.json`
   - Edit `Frontend/src/aws-config.js`
   - Replace placeholder values with your actual AWS Cognito settings

### Backend Security Setup

1. **Environment Variables**:
   ```bash
   # Copy environment template
   cp Backend/.env.example Backend/.env

   # Edit Backend/.env with your actual values
   ```

2. **Database Configuration**:
   - Update DATABASE_URL with your PostgreSQL connection string
   - Set strong JWT_SECRET for authentication
   - Configure Gmail API credentials if using email integration

### LangGraph Service Security

1. **API Keys**:
   ```bash
   # Copy configuration template
   cp langgraph-service/config.py.example langgraph-service/config.py

   # Edit config.py with your API keys:
   GROQ_API_KEY = "your_actual_groq_api_key"
   LANGCHAIN_API_KEY = "your_actual_langsmith_api_key"
   ```

## Security Best Practices

### Development
- Never commit real API keys or credentials
- Use environment variables for all sensitive data
- Keep .env files in .gitignore
- Use different credentials for development and production

### Production
- Use strong, unique passwords and secrets
- Enable HTTPS/SSL certificates
- Implement proper authentication and authorization
- Regularly rotate API keys and credentials
- Monitor API usage and costs
- Set up proper logging and monitoring
- Use environment variables or secure secret management
- Implement rate limiting and security headers

### API Key Security
- Store API keys in environment variables only
- Never hardcode credentials in source code
- Use different API keys for different environments
- Monitor API usage for unusual activity
- Set up billing alerts for cloud services
- Regularly audit and rotate credentials
