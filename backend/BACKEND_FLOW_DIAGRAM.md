# 🎯 DIAGRAMA DE FLUJO COMPLETO - BACKEND AIRBNB CLONE

## 🔄 FLUJO GENERAL DEL SISTEMA

```mermaid
graph TD
    subgraph "Frontend Layer"
        A[React Components] --> B[Redux Store]
        B --> C[API Service]
    end
    
    subgraph "Backend Layer"
        C --> D[Express Server]
        D --> E[Middleware Stack]
        E --> F[Route Handlers]
        F --> G[Controllers]
        G --> H[Services]
        H --> I[Models]
        I --> J[MongoDB]
    end
    
    subgraph "External Services"
        I --> K[Stripe]
        I --> L[Email Service]
        I --> M[Cloud Storage]
    end
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthController
    participant AuthService
    participant UserModel
    participant JWT
    participant Database
    
    Client->>API: POST /api/auth/register
    API->>AuthController: register()
    AuthController->>UserModel: findOne({email})
    UserModel->>Database: query
    Database-->>UserModel: null (user doesn't exist)
    UserModel-->>AuthController: user not found
    AuthController->>UserModel: create(newUser)
    UserModel->>Database: insert
    Database-->>UserModel: user created
    UserModel-->>AuthController: user object
    AuthController->>AuthService: generateTokens(user)
    AuthService->>JWT: sign(payload, secret)
    JWT-->>AuthService: accessToken + refreshToken
    AuthService-->>AuthController: tokens
    AuthController-->>API: 201 Created + tokens
    API-->>Client: JSON response
    
    Client->>API: POST /api/auth/login
    API->>AuthController: login()
    AuthController->>UserModel: findOne({email})
    UserModel->>Database: query
    Database-->>UserModel: user object
    UserModel-->>AuthController: user found
    AuthController->>UserModel: comparePassword()
    UserModel-->>AuthController: password valid
    AuthController->>AuthService: generateTokens(user)
    AuthService-->>AuthController: tokens
    AuthController-->>API: 200 OK + tokens
    API-->>Client: JSON response
```

---

## 🏠 FLUJO DE PROPIEDADES

```mermaid
sequenceDiagram
    participant Guest
    participant API
    participant PropertyController
    participant PropertyService
    participant PropertyModel
    participant PropertyModel
    participant CloudStorage
    participant Database
    
    Guest->>API: GET /api/properties?city=Madrid&guests=4
    API->>PropertyController: getProperties()
    PropertyController->>PropertyService: filterProperties(filters)
    PropertyService->>PropertyModel: find({...filters})
    PropertyModel->>Database: query with geospatial
    Database-->>PropertyModel: properties array
    PropertyModel-->>PropertyService: populated properties
    PropertyService-->>PropertyController: filtered results
    PropertyController-->>API: 200 OK + properties
    API-->>Guest: JSON response
    
    Guest->>API: POST /api/properties
    API->>PropertyController: createProperty()
    PropertyController->>PropertyService: validateProperty(data)
    PropertyService-->>PropertyController: validation ok
    PropertyController->>CloudStorage: uploadImages()
    CloudStorage-->>PropertyController: image URLs
    PropertyController->>PropertyModel: create(propertyData)
    PropertyModel->>Database: insert
    Database-->>PropertyModel: property created
    PropertyController-->>API: 201 Created
    API-->>Guest: JSON response
```

---

## 📅 FLUJO DE RESERVAS

```mermaid
sequenceDiagram
    participant Guest
    participant API
    participant BookingController
    participant BookingService
    participant BookingModel
    participant PropertyModel
    participant Stripe
    participant Database
    
    Guest->>API: POST /api/bookings
    API->>BookingController: createBooking()
    BookingController->>BookingService: checkAvailability()
    BookingService->>BookingModel: find({property, dates})
    BookingModel->>Database: query bookings
    Database-->>BookingModel: existing bookings
    BookingModel-->>BookingService: availability result
    
    alt Available
        BookingService->>PropertyModel: findById(propertyId)
        PropertyModel->>Database: query
        Database-->>PropertyModel: property details
        PropertyModel-->>BookingService: property info
        
        BookingService->>BookingService: calculatePrice()
        BookingService-->>BookingController: pricing details
        
        BookingController->>BookingModel: create(bookingData)
        BookingModel->>Database: insert
        Database-->>BookingModel: booking created
        BookingController-->>BookingController: booking object
        
        BookingController->>Stripe: createPaymentIntent()
        Stripe-->>BookingController: client_secret
        
        BookingController-->>API: 201 Created + client_secret
        API-->>Guest: JSON response
        
    else Not Available
        BookingService-->>BookingController: throw Error
        BookingController-->>API: 409 Conflict
        API-->>Guest: Error message
    end
```

---

## 💳 FLUJO DE PAGOS

```mermaid
sequenceDiagram
    participant Guest
    participant API
    participant PaymentController
    participant StripeService
    participant BookingModel
    participant StripeAPI
    participant EmailService
    
    Guest->>API: POST /api/payments/confirm
    API->>PaymentController: confirmPayment()
    PaymentController->>StripeService: verifyPayment(paymentIntentId)
    StripeService->>StripeAPI: retrievePaymentIntent()
    StripeAPI-->>StripeService: payment details
    
    alt Payment Successful
        StripeService-->>PaymentController: payment confirmed
        PaymentController->>BookingModel: updateStatus('confirmed')
        BookingModel->>Database: update
        Database-->>BookingModel: updated booking
        PaymentController->>EmailService: sendConfirmation()
        EmailService-->>PaymentController: email sent
        PaymentController-->>API: 200 OK
        API-->>Guest: Success response
        
    else Payment Failed
        StripeService-->>PaymentController: payment failed
        PaymentController-->>API: 400 Bad Request
        API-->>Guest: Error message
    end
```

---

## 🏗️ FLUJO DE HOST DASHBOARD

```mermaid
sequenceDiagram
    participant Host
    participant API
    participant HostController
    participant PropertyModel
    participant BookingModel
    participant Database
    
    Host->>API: GET /api/host/dashboard
    API->>HostController: getDashboard()
    
    HostController->>PropertyModel: count({host: userId})
    PropertyModel->>Database: aggregate
    Database-->>PropertyModel: property count
    
    HostController->>BookingModel: find({hostProperties})
    BookingModel->>Database: aggregate bookings
    Database-->>BookingModel: booking stats
    
    HostController->>BookingModel: calculateEarnings()
    BookingModel->>Database: sum total prices
    Database-->>BookingModel: earnings data
    
    HostController-->>API: dashboard data
    API-->>Host: dashboard data
    
    Host->>API: PUT /api/bookings/:id/accept
    API->>HostController: acceptBooking()
    HostController->>BookingModel: updateStatus('confirmed')
    BookingModel->>Database: update
    Database-->>BookingModel: updated booking
    HostController-->>API: 200 OK
    API-->>Host: Success response
```

---

## 🔄 FLUJO DE ERRORES

```mermaid
graph TD
    A[Request] --> B{Validation Error?}
    B -->|Yes| C[400 Bad Request]
    B -->|No| D{Authentication Error?}
    D -->|Yes| E[401 Unauthorized]
    D -->|No| E{Authorization Error?}
    E -->|Yes| F[403 Forbidden]
    E -->|No| F{Resource Not Found?}
    F -->|Yes| G[404 Not Found]
    F -->|No| G{Conflict?}
    G -->|Yes| H[409 Conflict]
    G -->|No| H{Server Error?}
    H -->|Yes| I[500 Internal Server Error]
    H -->|No| I[200 OK]
    
    C --> J[Error Handler Middleware]
    J --> K[Log Error]
    K --> L[Send JSON Response]
```

---

## 📊 FLUJO DE DATOS COMPLETO

```mermaid
graph LR
    subgraph "Application Monitoring"
        A[Express App] --> B[Morgan Logger]
        B --> C[Winston Logger]
        C --> D[Log Files]
        C --> E[Console Output]
        
        F[Error Handler] --> G[Error Tracking]
        G --> H[Sentry]
        
        I[Performance] --> J[APM]
        J --> K[New Relic]
    end
    
    subgraph "Health Checks"
        L[Health Endpoint] --> K[Database Check]
        L --> M[Redis Check]
        L --> N[External APIs Check]
    end
```

---

## 🎯 RESUMEN DE FLUJOS POR CAPA

### **1. Capa de Presentación (Frontend)**
- **Componentes React** → **Redux Store** → **API Service**

### **2. Capa de API (Backend)**
- **Express Routes** → **Middleware** → **Controllers**

### **3. Capa de Servicios**
- **Business Logic** → **External APIs** → **Data Processing**

### **4. Capa de Datos**
- **MongoDB Models** → **Redis Cache** → **File Storage**

### **5. Capa de Infraestructura**
- **Docker Containers** → **Load Balancer** → **CDN"
