# Tickets Secure API

A secure Node.js API for event management and ticketing system built with Express.js and MySQL/MariaDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Event Management**: Create, update, delete events with full CRUD operations
- **Ticket System**: Purchase tickets, generate unique codes, scan validation
- **Payment Processing**: Handle payments with multiple providers and refund support
- **Messaging**: Real-time messaging system between users
- **Notifications**: User notifications with read/unread status
- **User Management**: Complete user profiles with roles and permissions
- **Security**: Rate limiting, input validation, SQL injection protection
- **Logging**: Comprehensive audit and system logging

## Database Schema

The API is built on a comprehensive event management database with the following main entities:

- **Users & Authentication**: Users, roles, profiles
- **Events**: Events, categories, venues, statuses
- **Tickets**: Ticket types, purchases, scanning
- **Payments**: Payment processing, providers, refunds
- **Communication**: Messages, notifications
- **Analytics**: Event statistics, user statistics, audit logs

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickets-secure-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=gestion_evenements

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up the database**
   - Import the provided SQL schema: `gestion_evenements.sql`
   - Ensure your MySQL/MariaDB server is running

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "John Doe",
  "email": "john@example.com",
  "motDePasse": "password123",
  "roleId": 2
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "motDePasse": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Events Endpoints

#### Get All Events
```http
GET /api/events?page=1&limit=10&categorieId=1&search=concert
```

#### Get Event by ID
```http
GET /api/events/123
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "titre": "Summer Concert",
  "description": "Amazing summer concert",
  "dateDebut": "2024-07-15T19:00:00.000Z",
  "dateFin": "2024-07-15T23:00:00.000Z",
  "maxBillets": 1000,
  "categorieId": 1,
  "lieuId": 1,
  "statutId": 1
}
```

### Tickets Endpoints

#### Get Event Tickets
```http
GET /api/tickets/event/123
```

#### Purchase Tickets
```http
POST /api/tickets/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "billetId": 456,
  "quantite": 2
}
```

#### Get My Tickets
```http
GET /api/tickets/my?page=1&limit=10
Authorization: Bearer <token>
```

#### Scan Ticket
```http
POST /api/tickets/scan
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "TICKET-1640995200000-ABC123XYZ",
  "statutId": 1
}
```

### Payments Endpoints

#### Create Payment
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "achatBilletId": 789,
  "prestataireId": 1,
  "evenementId": 123,
  "montant": 50.00,
  "reference": "PAY-1640995200000"
}
```

#### Payment Webhook
```http
POST /api/payments/webhook/stripe
Content-Type: application/json

{
  "reference": "PAY-1640995200000",
  "status": "SUCCES",
  "amount": 50.00
}
```

### Messages Endpoints

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "destinataireId": 456,
  "contenu": "Hello, how are you?"
}
```

#### Get Conversations
```http
GET /api/messages/conversations?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Conversation with User
```http
GET /api/messages/conversation/456?page=1&limit=50
Authorization: Bearer <token>
```

### Notifications Endpoints

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&unread=true
Authorization: Bearer <token>
```

#### Mark as Read
```http
PUT /api/notifications/123/read
Authorization: Bearer <token>
```

## User Roles

- **ADMIN**: Full system access
- **ORGANIZER**: Can create and manage events
- **USER**: Can purchase tickets and send messages
- **SCANNER**: Can scan tickets at events

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse with configurable limits
- **Input Validation**: Comprehensive request validation using Joi
- **SQL Injection Protection**: Parameterized queries throughout
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Helmet.js**: Security headers for Express applications
- **Password Hashing**: Secure password storage with bcrypt

## Error Handling

The API uses consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
├── config/
│   └── database.js       # Database configuration
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── validation.js     # Request validation
├── models/
│   ├── User.js           # User model
│   └── Event.js          # Event model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── events.js         # Event management routes
│   ├── tickets.js        # Ticket management routes
│   ├── payments.js       # Payment processing routes
│   ├── messages.js       # Messaging routes
│   ├── notifications.js  # Notification routes
│   └── users.js          # User management routes
├── server.js             # Main server file
├── package.json
└── README.md
```

## License

MIT License - see LICENSE file for details.
