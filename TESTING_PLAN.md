# API Testing Plan

## 🚀 Server Status: ✅ RUNNING
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📋 Testing Plan

### Phase 1: Basic Connectivity (High Priority)

#### 1.1 Health Check
```bash
curl http://localhost:3000/health
```
**Expected**: Status 200 with server info

#### 1.2 Test Database Connection
Check server logs for "✅ SQLite database connected successfully"

---

### Phase 2: Authentication (High Priority)

#### 2.1 User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "motDePasse": "password123",
    "roleId": 3
  }'
```
**Expected**: Status 201 with user data and JWT token

#### 2.2 User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "motDePasse": "password123"
  }'
```
**Expected**: Status 200 with user data and JWT token

#### 2.3 Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: Status 200 with user profile data

---

### Phase 3: Event Management (Medium Priority)

#### 3.1 Get All Events
```bash
curl http://localhost:3000/api/events
```
**Expected**: Status 200 with events array

#### 3.2 Get Event by ID
```bash
curl http://localhost:3000/api/events/1
```
**Expected**: Status 200 with event details, statistics, tickets

#### 3.3 Create Event (Organizer role required)
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -d '{
    "titre": "Test Event",
    "description": "Test description",
    "dateDebut": "2024-12-01T19:00:00.000Z",
    "dateFin": "2024-12-01T22:00:00.000Z",
    "maxBillets": 100,
    "categorieId": 1,
    "lieuId": 1,
    "statutId": 1
  }'
```
**Expected**: Status 201 with created event

---

### Phase 4: Ticket System (Medium Priority)

#### 4.1 Get Event Tickets
```bash
curl http://localhost:3000/api/tickets/event/1
```
**Expected**: Status 200 with available tickets

#### 4.2 Purchase Tickets
```bash
curl -X POST http://localhost:3000/api/tickets/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "billetId": 1,
    "quantite": 2
  }'
```
**Expected**: Status 200 with purchase details and unique codes

#### 4.3 Get My Tickets
```bash
curl http://localhost:3000/api/tickets/my \
  -H "Authorization: Bearer USER_TOKEN"
```
**Expected**: Status 200 with user's tickets

#### 4.4 Scan Ticket
```bash
curl -X POST http://localhost:3000/api/tickets/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SCANNER_TOKEN" \
  -d '{
    "code": "TICKET-CODE-FROM-PURCHASE",
    "statutId": 1
  }'
```
**Expected**: Status 200 with scan result

---

### Phase 5: Payment Processing (Medium Priority)

#### 5.1 Get Payment Providers
```bash
curl http://localhost:3000/api/payments/providers
```
**Expected**: Status 200 with payment providers list

#### 5.2 Create Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "achatBilletId": 1,
    "prestataireId": 1,
    "evenementId": 1,
    "montant": 99.99,
    "reference": "PAY-TEST-001"
  }'
```
**Expected**: Status 200 with payment details

#### 5.3 Payment Webhook (Simulate)
```bash
curl -X POST http://localhost:3000/api/payments/webhook/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "PAY-TEST-001",
    "status": "SUCCES",
    "amount": 99.99
  }'
```
**Expected**: Status 200 with webhook confirmation

---

### Phase 6: Messaging & Notifications (Low Priority)

#### 6.1 Send Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "destinataireId": 2,
    "contenu": "Hello, this is a test message!"
  }'
```
**Expected**: Status 201 with message details

#### 6.2 Get Conversations
```bash
curl http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer USER_TOKEN"
```
**Expected**: Status 200 with conversations list

#### 6.3 Get Notifications
```bash
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer USER_TOKEN"
```
**Expected**: Status 200 with notifications list

---

### Phase 7: User Management (Low Priority)

#### 7.1 Get All Users (Admin only)
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected**: Status 200 with users list

#### 7.2 Get User Roles
```bash
curl http://localhost:3000/api/users/roles/list
```
**Expected**: Status 200 with roles list

---

### Phase 8: Error Handling (Low Priority)

#### 8.1 Invalid Endpoint
```bash
curl http://localhost:3000/api/nonexistent
```
**Expected**: Status 404 with error message

#### 8.2 Invalid Token
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer INVALID_TOKEN"
```
**Expected**: Status 403 with error message

#### 8.3 Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom": "Test"}'
```
**Expected**: Status 400 with validation errors

---

## 🔑 Test Users from Dummy Data

| Email | Password | Role | Use For |
|-------|----------|------|---------|
| john.doe@example.com | password | USER | General testing |
| jane.smith@example.com | password | ORGANIZER | Event creation |
| admin@example.com | password | ADMIN | Admin functions |
| mike.johnson@example.com | password | SCANNER | Ticket scanning |

## 🛠️ Testing Tools

### Option 1: Postman (Recommended)

#### Setup Postman Collection
1. **Create New Collection**: "Tickets Secure API"
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `userToken`: (will be set after login)
   - `organizerToken`: (will be set after login)
   - `adminToken`: (will be set after login)

#### Import Endpoints
Create requests for each endpoint with the following structure:

**Authentication Requests:**
- `POST {{baseUrl}}/api/auth/register`
- `POST {{baseUrl}}/api/auth/login` 
- `GET {{baseUrl}}/api/auth/profile`

**Event Requests:**
- `GET {{baseUrl}}/api/events`
- `GET {{baseUrl}}/api/events/{{eventId}}`
- `POST {{baseUrl}}/api/events`

**Ticket Requests:**
- `GET {{baseUrl}}/api/tickets/event/{{eventId}}`
- `POST {{baseUrl}}/api/tickets/purchase`
- `GET {{baseUrl}}/api/tickets/my`

#### Complete Postman Setup Guide

**Step 1: Create Environment**
1. Open Postman → Environments → Add
2. Name: "Tickets API Dev"
3. Add variables:
   - `baseUrl`: `http://localhost:3000`
   - `userToken`: (empty)
   - `organizerToken`: (empty)
   - `adminToken`: (empty)
   - `eventId`: `1` (for testing)

**Step 2: Create Collection**
1. Collections → New Collection
2. Name: "Tickets Secure API"
3. Set Authorization: "Inherit auth from parent collection"

**Step 3: Add Authentication Folder**
- **Register User**: 
  - Method: POST
  - URL: `{{baseUrl}}/api/auth/register`
  - Body: JSON with user data
  
- **Login as User**:
  - Method: POST  
  - URL: `{{baseUrl}}/api/auth/login`
  - Body: `{"email": "john.doe@example.com", "motDePasse": "password"}`
  - Tests: `pm.environment.set("userToken", pm.response.json().token)`

- **Login as Organizer**:
  - Method: POST
  - URL: `{{baseUrl}}/api/auth/login`  
  - Body: `{"email": "jane.smith@example.com", "motDePasse": "password"}`
  - Tests: `pm.environment.set("organizerToken", pm.response.json().token)`

- **Login as Admin**:
  - Method: POST
  - URL: `{{baseUrl}}/api/auth/login`
  - Body: `{"email": "admin@example.com", "motDePasse": "password"}`
  - Tests: `pm.environment.set("adminToken", pm.response.json().token)`

**Step 4: Add Events Folder**
- **Get All Events**: GET `{{baseUrl}}/api/events`
- **Get Event by ID**: GET `{{baseUrl}}/api/events/{{eventId}}`
- **Create Event**: POST `{{baseUrl}}/api/events` (Auth: Bearer {{organizerToken}})

**Step 5: Add Tickets Folder**
- **Get Event Tickets**: GET `{{baseUrl}}/api/tickets/event/{{eventId}}`
- **Purchase Ticket**: POST `{{baseUrl}}/api/tickets/purchase` (Auth: Bearer {{userToken}})
- **Get My Tickets**: GET `{{baseUrl}}/api/tickets/my` (Auth: Bearer {{userToken}})
- **Scan Ticket**: POST `{{baseUrl}}/api/tickets/scan` (Auth: Bearer {{adminToken}})

**Step 6: Test Workflow**
1. Run "Login as User" → sets `userToken`
2. Run "Get All Events" → see available events
3. Run "Get Event Tickets" → see ticket options  
4. Run "Purchase Ticket" → buy a ticket
5. Run "Get My Tickets" → verify purchase
6. Run "Scan Ticket" → test validation

**Pro Tips:**
- Use "Runner" to execute requests in sequence
- Save responses to see data structure
- Use "Tests" tab to validate responses
- Check "Console" for debugging

### Option 2: Browser Testing
- Use browser for GET endpoints
- Use browser DevTools for network inspection

### Option 3: cURL Commands
Copy-paste the commands below in terminal

## 📊 Success Criteria

- ✅ All endpoints return appropriate HTTP status codes
- ✅ Authentication works correctly
- ✅ Database operations complete successfully
- ✅ Error handling is proper
- ✅ Rate limiting works
- ✅ Validation prevents invalid data

## 🚨 Common Issues

1. **CORS errors**: Use proper headers or test with cURL
2. **Token expiration**: Tokens expire after 7 days
3. **Database locked**: SQLite may lock during concurrent access
4. **Permission errors**: Check user roles for protected endpoints

## 📝 Notes

- Replace `YOUR_JWT_TOKEN` with actual tokens from login responses
- Replace `ORGANIZER_TOKEN`, `ADMIN_TOKEN`, `SCANNER_TOKEN` with appropriate user tokens
- Test in order from Phase 1 to Phase 8
- Check server logs for detailed error messages
