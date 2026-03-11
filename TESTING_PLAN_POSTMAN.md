# Postman API Testing Plan

## 🚀 Server Status: ✅ RUNNING
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## ⚙️ Setup & Configuration

### Step 1: Environment Setup
1. Open Postman → Environments → **Add**
2. **Name**: "Tickets API Dev"
3. **Add Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `userToken`: (empty - will be auto-filled)
   - `organizerToken`: (empty - will be auto-filled)
   - `adminToken`: (empty - will be auto-filled)
   - `scannerToken`: (empty - will be auto-filled)
   - `eventId`: `1` (for testing)
   - `userId`: `1` (for testing)

### Step 2: Collection Setup
1. Collections → **New Collection**
2. **Name**: "Tickets Secure API"
3. **Authorization**: Leave as "No Auth" (we'll set auth at request level)
4. **Pre-request Script** (optional):
```javascript
// Log current environment for debugging
console.log("Current Environment:", pm.environment.values);
```

### Step 3: Collection Folders Structure
Create these folders in your collection:

#### 📁 Authentication
- **Register User**: POST `{{baseUrl}}/api/auth/register`
- **Login as User**: POST `{{baseUrl}}/api/auth/login` (saves `userToken`)
- **Login as Organizer**: POST `{{baseUrl}}/api/auth/login` (saves `organizerToken`)
- **Login as Admin**: POST `{{baseUrl}}/api/auth/login` (saves `adminToken`)
- **Login as Scanner**: POST `{{baseUrl}}/api/auth/login` (saves `scannerToken`)
- **Get Profile**: GET `{{baseUrl}}/api/auth/profile`

#### 📁 Events
- **Get All Events**: GET `{{baseUrl}}/api/events`
- **Get Event by ID**: GET `{{baseUrl}}/api/events/{{eventId}}`
- **Create Event**: POST `{{baseUrl}}/api/events` (Auth: `{{organizerToken}}`)
- **Update Event**: PUT `{{baseUrl}}/api/events/{{eventId}}`
- **Delete Event**: DELETE `{{baseUrl}}/api/events/{{eventId}}`

#### 📁 Tickets
- **Get Event Tickets**: GET `{{baseUrl}}/api/tickets/event/{{eventId}}`
- **Purchase Ticket**: POST `{{baseUrl}}/api/tickets/purchase` (Auth: `{{userToken}}`)
- **Get My Tickets**: GET `{{baseUrl}}/api/tickets/my` (Auth: `{{userToken}}`)
- **Scan Ticket**: POST `{{baseUrl}}/api/tickets/scan` (Auth: `{{scannerToken}}`)
- **Get Scan History**: GET `{{baseUrl}}/api/tickets/scan/history/{{eventId}}`

#### 📁 Payments
- **Get Providers**: GET `{{baseUrl}}/api/payments/providers`
- **Create Payment**: POST `{{baseUrl}}/api/payments` (Auth: `{{userToken}}`)
- **Payment Webhook**: POST `{{baseUrl}}/api/payments/webhook/stripe`
- **Get My Payments**: GET `{{baseUrl}}/api/payments/my/payments` (Auth: `{{userToken}}`)

#### 📁 Messages
- **Send Message**: POST `{{baseUrl}}/api/messages` (Auth: `{{userToken}}`)
- **Get Conversations**: GET `{{baseUrl}}/api/messages/conversations` (Auth: `{{userToken}}`)
- **Get Conversation**: GET `{{baseUrl}}/api/messages/conversation/{{userId}}` (Auth: `{{userToken}}`)
- **Search Messages**: GET `{{baseUrl}}/api/messages/search?q=test` (Auth: `{{userToken}}`)

#### 📁 Notifications
- **Get Notifications**: GET `{{baseUrl}}/api/notifications` (Auth: `{{userToken}}`)
- **Mark as Read**: PUT `{{baseUrl}}/api/notifications/{{notificationId}}/read` (Auth: `{{userToken}}`)
- **Create Notification**: POST `{{baseUrl}}/api/notifications` (Auth: `{{adminToken}}`)

#### 📁 Users (Admin)
- **Get All Users**: GET `{{baseUrl}}/api/users` (Auth: `{{adminToken}}`)
- **Get User by ID**: GET `{{baseUrl}}/api/users/{{userId}}` (Auth: `{{adminToken}}`)
- **Get User Roles**: GET `{{baseUrl}}/api/users/roles/list`
- **Update User**: PUT `{{baseUrl}}/api/users/{{userId}}` (Auth: `{{adminToken}}`)

### Step 4: Test Scripts for Authentication
Add these scripts to the **Post-response** tab for each login request:

#### Login as User:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("userToken", response.token);
    pm.test("User login successful", function () {
        pm.expect(response.user.email).to.eql("john.doe@example.com");
    });
}
```

#### Login as Organizer:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("organizerToken", response.token);
    pm.test("Organizer login successful", function () {
        pm.expect(response.user.email).to.eql("jane.smith@example.com");
    });
}
```

#### Login as Admin:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("adminToken", response.token);
    pm.test("Admin login successful", function () {
        pm.expect(response.user.email).to.eql("admin@example.com");
    });
}
```

#### Login as Scanner:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("scannerToken", response.token);
    pm.test("Scanner login successful", function () {
        pm.expect(response.user.email).to.eql("mike.johnson@example.com");
    });
}
```

### Step 5: Common Test Scripts
Add these to the **Post-response** tab for common validation:

#### Status Code Check:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

#### Response Time Check:
```javascript
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

#### JSON Validation:
```javascript
pm.test("Response is valid JSON", function () {
    pm.response.to.be.json;
});
```

---

## 📋 Postman Testing Plan

### Phase 1: Basic Connectivity (High Priority)

#### 1.1 Health Check
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/health`
- **Expected**: Status 200 with server info

#### 1.2 Test Database Connection
Check server logs for "✅ SQLite database connected successfully"

---

### Phase 2: Authentication (High Priority)

#### 2.1 User Registration
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/register`
- **Body** (raw JSON):
```json
{
  "nom": "Test User",
  "email": "test@example.com",
  "motDePasse": "password123",
  "roleId": 3
}
```
- **Expected**: Status 201 with user data and JWT token

#### 2.2 User Login
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/login`
- **Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "motDePasse": "password123"
}
```
- **Tests Tab Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("userToken", response.token);
}
```
- **Expected**: Status 200 with user data and JWT token

#### 2.3 Get Profile (with token)
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/auth/profile`
- **Authorization**: Bearer Token `{{userToken}}`
- **Expected**: Status 200 with user profile data

---

### Phase 3: Event Management (Medium Priority)

#### 3.1 Get All Events
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/events`
- **Expected**: Status 200 with events array

#### 3.2 Get Event by ID
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/events/{{eventId}}`
- **Expected**: Status 200 with event details, statistics, tickets

#### 3.3 Create Event (Organizer role required)
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/events`
- **Authorization**: Bearer Token `{{organizerToken}}`
- **Body** (raw JSON):
```json
{
  "titre": "Test Event",
  "description": "Test description",
  "dateDebut": "2024-12-01T19:00:00.000Z",
  "dateFin": "2024-12-01T22:00:00.000Z",
  "maxBillets": 100,
  "categorieId": 1,
  "lieuId": 1,
  "statutId": 1
}
```
- **Expected**: Status 201 with created event

---

### Phase 4: Ticket System (Medium Priority)

#### 4.1 Get Event Tickets
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/tickets/event/{{eventId}}`
- **Expected**: Status 200 with available tickets

#### 4.2 Purchase Tickets
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/tickets/purchase`
- **Authorization**: Bearer Token `{{userToken}}`
- **Body** (raw JSON):
```json
{
  "billetId": 1,
  "quantite": 2
}
```
- **Expected**: Status 200 with purchase details and unique codes

#### 4.3 Get My Tickets
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/tickets/my`
- **Authorization**: Bearer Token `{{userToken}}`
- **Expected**: Status 200 with user's tickets

#### 4.4 Scan Ticket
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/tickets/scan`
- **Authorization**: Bearer Token `{{scannerToken}}`
- **Body** (raw JSON):
```json
{
  "code": "TICKET-CODE-FROM-PURCHASE",
  "statutId": 1
}
```
- **Expected**: Status 200 with scan result

---

### Phase 5: Payment Processing (Medium Priority)

#### 5.1 Get Payment Providers
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/payments/providers`
- **Expected**: Status 200 with payment providers list

#### 5.2 Create Payment
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/payments`
- **Authorization**: Bearer Token `{{userToken}}`
- **Body** (raw JSON):
```json
{
  "achatBilletId": 1,
  "prestataireId": 1,
  "evenementId": 1,
  "montant": 99.99,
  "reference": "PAY-TEST-001"
}
```
- **Expected**: Status 200 with payment details

#### 5.3 Payment Webhook (Simulate)
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/payments/webhook/stripe`
- **Body** (raw JSON):
```json
{
  "reference": "PAY-TEST-001",
  "status": "SUCCES",
  "amount": 99.99
}
```
- **Expected**: Status 200 with webhook confirmation

---

### Phase 6: Messaging & Notifications (Low Priority)

#### 6.1 Send Message
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/messages`
- **Authorization**: Bearer Token `{{userToken}}`
- **Body** (raw JSON):
```json
{
  "destinataireId": 2,
  "contenu": "Hello, this is a test message!"
}
```
- **Expected**: Status 201 with message details

#### 6.2 Get Conversations
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/messages/conversations`
- **Authorization**: Bearer Token `{{userToken}}`
- **Expected**: Status 200 with conversations list

#### 6.3 Get Notifications
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/notifications`
- **Authorization**: Bearer Token `{{userToken}}`
- **Expected**: Status 200 with notifications list

---

### Phase 7: User Management (Low Priority)

#### 7.1 Get All Users (Admin only)
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/users`
- **Authorization**: Bearer Token `{{adminToken}}`
- **Expected**: Status 200 with users list

#### 7.2 Get User Roles
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/users/roles/list`
- **Expected**: Status 200 with roles list

---

### Phase 8: Error Handling (Low Priority)

#### 8.1 Invalid Endpoint
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/nonexistent`
- **Expected**: Status 404 with error message

#### 8.2 Invalid Token
**Postman Request**: 
- **Method**: GET
- **URL**: `{{baseUrl}}/api/auth/profile`
- **Authorization**: Bearer Token `INVALID_TOKEN`
- **Expected**: Status 403 with error message

#### 8.3 Missing Required Fields
**Postman Request**: 
- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/register`
- **Body** (raw JSON):
```json
{"nom": "Test"}
```
- **Expected**: Status 400 with validation errors

---

## 🔑 Test Users from Dummy Data

| Email | Password | Role | Postman Token Variable |
|-------|----------|------|------------------------|
| john.doe@example.com | password | USER | `userToken` |
| jane.smith@example.com | password | ORGANIZER | `organizerToken` |
| admin@example.com | password | ADMIN | `adminToken` |
| mike.johnson@example.com | password | SCANNER | `scannerToken` |

---

## 🛠️ Complete Postman Setup

### Step 1: Create Environment
1. Open Postman → Environments → Add
2. Name: "Tickets API Dev"
3. Add variables:
   - `baseUrl`: `http://localhost:3000`
   - `userToken`: (empty - will be auto-filled)
   - `organizerToken`: (empty - will be auto-filled)
   - `adminToken`: (empty - will be auto-filled)
   - `scannerToken`: (empty - will be auto-filled)
   - `eventId`: `1` (for testing)

### Step 2: Create Collection
1. Collections → New Collection
2. Name: "Tickets Secure API"
3. Set Authorization: "Inherit auth from parent collection"

### Step 3: Organize Collection Folders
Create these folders in your collection:

#### 📁 Authentication
- **Register User**: POST `{{baseUrl}}/api/auth/register`
- **Login as User**: POST `{{baseUrl}}/api/auth/login` (saves `userToken`)
- **Login as Organizer**: POST `{{baseUrl}}/api/auth/login` (saves `organizerToken`)
- **Login as Admin**: POST `{{baseUrl}}/api/auth/login` (saves `adminToken`)
- **Login as Scanner**: POST `{{baseUrl}}/api/auth/login` (saves `scannerToken`)
- **Get Profile**: GET `{{baseUrl}}/api/auth/profile`

#### 📁 Events
- **Get All Events**: GET `{{baseUrl}}/api/events`
- **Get Event by ID**: GET `{{baseUrl}}/api/events/{{eventId}}`
- **Create Event**: POST `{{baseUrl}}/api/events` (Auth: `{{organizerToken}}`)
- **Update Event**: PUT `{{baseUrl}}/api/events/{{eventId}}`
- **Delete Event**: DELETE `{{baseUrl}}/api/events/{{eventId}}`

#### 📁 Tickets
- **Get Event Tickets**: GET `{{baseUrl}}/api/tickets/event/{{eventId}}`
- **Purchase Ticket**: POST `{{baseUrl}}/api/tickets/purchase` (Auth: `{{userToken}}`)
- **Get My Tickets**: GET `{{baseUrl}}/api/tickets/my` (Auth: `{{userToken}}`)
- **Scan Ticket**: POST `{{baseUrl}}/api/tickets/scan` (Auth: `{{scannerToken}}`)
- **Get Scan History**: GET `{{baseUrl}}/api/tickets/scan/history/{{eventId}}`

#### 📁 Payments
- **Get Providers**: GET `{{baseUrl}}/api/payments/providers`
- **Create Payment**: POST `{{baseUrl}}/api/payments` (Auth: `{{userToken}}`)
- **Payment Webhook**: POST `{{baseUrl}}/api/payments/webhook/stripe`
- **Get My Payments**: GET `{{baseUrl}}/api/payments/my/payments` (Auth: `{{userToken}}`)

#### 📁 Messages
- **Send Message**: POST `{{baseUrl}}/api/messages` (Auth: `{{userToken}}`)
- **Get Conversations**: GET `{{baseUrl}}/api/messages/conversations` (Auth: `{{userToken}}`)
- **Get Conversation**: GET `{{baseUrl}}/api/messages/conversation/{{userId}}` (Auth: `{{userToken}}`)
- **Search Messages**: GET `{{baseUrl}}/api/messages/search?q=test` (Auth: `{{userToken}}`)

#### 📁 Notifications
- **Get Notifications**: GET `{{baseUrl}}/api/notifications` (Auth: `{{userToken}}`)
- **Mark as Read**: PUT `{{baseUrl}}/api/notifications/{{notificationId}}/read` (Auth: `{{userToken}}`)
- **Create Notification**: POST `{{baseUrl}}/api/notifications` (Auth: `{{adminToken}}`)

#### 📁 Users (Admin)
- **Get All Users**: GET `{{baseUrl}}/api/users` (Auth: `{{adminToken}}`)
- **Get User by ID**: GET `{{baseUrl}}/api/users/{{userId}}` (Auth: `{{adminToken}}`)
- **Get User Roles**: GET `{{baseUrl}}/api/users/roles/list`
- **Update User**: PUT `{{baseUrl}}/api/users/{{userId}}` (Auth: `{{adminToken}}`)

### Step 4: Test Scripts for Login Requests
Add this to the "Tests" tab for each login request:

**Login as User**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("userToken", response.token);
    pm.test("User login successful", function () {
        pm.expect(response.user.email).to.eql("john.doe@example.com");
    });
}
```

**Login as Organizer**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("organizerToken", response.token);
    pm.test("Organizer login successful", function () {
        pm.expect(response.user.email).to.eql("jane.smith@example.com");
    });
}
```

**Login as Admin**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("adminToken", response.token);
    pm.test("Admin login successful", function () {
        pm.expect(response.user.email).to.eql("admin@example.com");
    });
}
```

**Login as Scanner**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("scannerToken", response.token);
    pm.test("Scanner login successful", function () {
        pm.expect(response.user.email).to.eql("mike.johnson@example.com");
    });
}
```

---

## 🚀 Quick Testing Workflow

### Step 1: Setup Tokens
1. Run "Login as User" → sets `userToken`
2. Run "Login as Organizer" → sets `organizerToken`
3. Run "Login as Admin" → sets `adminToken`
4. Run "Login as Scanner" → sets `scannerToken`

### Step 2: Test Events
1. Run "Get All Events" → see available events
2. Run "Get Event by ID" → view event details

### Step 3: Test Ticket Flow
1. Run "Get Event Tickets" → see ticket options
2. Run "Purchase Ticket" → buy a ticket
3. Run "Get My Tickets" → verify purchase
4. Run "Scan Ticket" → test validation

### Step 4: Test Advanced Features
1. Run "Create Payment" → process payment
2. Run "Send Message" → test messaging
3. Run "Get Notifications" → check notifications

---

## 📊 Success Criteria

- ✅ All Postman requests return appropriate HTTP status codes
- ✅ Authentication tokens are saved and used correctly
- ✅ Database operations complete successfully
- ✅ Error handling returns proper error messages
- ✅ Rate limiting works (test with rapid requests)
- ✅ Validation prevents invalid data

---

## 🎯 Pro Tips

### Using Postman Runner
1. Select the collection
2. Click "Runner"
3. Select requests to run in sequence
4. Click "Run [Collection Name]"

### Debugging
- Use "Console" button to see logs
- Check "Tests" results for validation
- Use "Headers" tab to verify auth tokens
- Save responses to examine data structure

### Environment Management
- Duplicate environment for different testing scenarios
- Use "Initial Values" for default settings
- Use "Current Values" for runtime changes

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check if token is set in environment variables |
| 403 Forbidden | Verify user role has permission for endpoint |
| 404 Not Found | Check URL and ensure server is running |
| 500 Server Error | Check server logs for detailed error message |
| Token not saving | Ensure Tests tab script is correct |
| Environment variable not working | Check variable name matches exactly |

---

## 📝 Notes

- All requests use environment variables (`{{baseUrl}}`, `{{userToken}}`, etc.)
- Tokens are automatically saved when login requests succeed
- Test scripts validate responses and save tokens
- Use the exact email/password combinations from the dummy data
- Server must be running on http://localhost:3000
