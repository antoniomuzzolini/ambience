# Authentication Setup Guide

This guide will help you set up authentication with Neon DB for your Ambience Manager application.

## Prerequisites

1. A Neon DB account and database
2. Node.js and npm installed
3. Basic knowledge of environment variables

## Setup Steps

### 1. Set up Neon Database

1. Go to [Neon.tech](https://neon.tech/) and create an account
2. Create a new database project
3. Copy your connection string from the Neon dashboard

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Neon database URL and create a JWT secret:
   ```env
   NEON_DATABASE_URL=postgresql://username:password@your-neon-endpoint/database?sslmode=require
   JWT_SECRET=your_very_secure_jwt_secret_key_at_least_32_characters_long
   ```

### 3. Install Dependencies

The authentication dependencies should already be installed. If not, run:
```bash
npm install @neondatabase/serverless bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### 4. Database Schema

The database tables will be automatically created when the application first runs. The schema includes:

- `users` table with fields: id, name, email, password_hash, created_at, updated_at
- Email index for performance

### 5. Development

For local development:
```bash
npm run dev
```

The app will automatically handle user registration and login.

### 6. Deployment

For deployment on Vercel:

1. Set environment variables in your Vercel dashboard:
   - `NEON_DATABASE_URL`
   - `JWT_SECRET`

2. Deploy:
   ```bash
   vercel --prod
   ```

## Features

### Authentication Flow

1. **Registration**: New users can create accounts with name, email, and password
2. **Login**: Existing users can log in with email and password
3. **Protected Routes**: The main app is only accessible to authenticated users
4. **JWT Tokens**: Secure token-based authentication with automatic expiration
5. **User Profile**: Display user info and logout functionality

### Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token verification
- Input validation and sanitization
- CORS headers for API security
- Protected API endpoints

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your Neon DB URL is correct
   - Check that your database is running
   - Ensure SSL is enabled in the connection string

2. **JWT Token Issues**
   - Make sure JWT_SECRET is set and secure
   - Check token expiration settings
   - Clear browser localStorage if needed

3. **CORS Errors**
   - Verify API endpoints are properly configured
   - Check Vercel configuration for headers

### Database Reset

If you need to reset the database:
```sql
DROP TABLE IF EXISTS users;
```

The tables will be recreated automatically on the next app startup.

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret key
2. **Environment Variables**: Never commit `.env.local` to version control
3. **Password Policy**: Consider implementing stronger password requirements
4. **Rate Limiting**: Consider adding rate limiting for production
5. **HTTPS**: Always use HTTPS in production

## Next Steps

- Add password reset functionality
- Implement email verification
- Add user profile editing
- Consider adding OAuth providers (Google, GitHub, etc.)
- Add admin user management
- Implement user roles and permissions