# E-Commerce Checkout System

A Node.js checkout system built with TypeScript following Domain-Driven Design (DDD) and Hexagonal Architecture principles.

## Features

- **Stock Reservation**: 15-minute automatic lock on items during checkout
- **Dynamic Pricing**: Supports coupons (percentage & fixed) and payment method fees
- **Shipping Calculation**: Region-based shipping costs (EU/USA)
- **Payment Methods**: PayPal, Bank Transfer, Pay Later (installments)
- **Background Jobs**: Automatic cleanup of expired reservations
- **MongoDB**: Persistent storage with Mongoose ODM

## Architecture

The project follows Hexagonal Architecture with clear separation of concerns:

```
├── domain/              # Core business logic
│   ├── entities/        # Order, Product, OrderItem
│   ├── value-objects/   # Money, Address, PaymentMethod, Coupon
│   ├── services/        # PricingService, ShippingCalculator
│   └── repositories/    # Repository interfaces (ports)
├── application/         # Use cases & DTOs
│   ├── use-cases/       # Business workflows
│   └── dtos/            # Data transfer objects
└── infrastructure/      # External adapters
    ├── adapters/        # MongoDB repositories
    ├── api/             # REST controllers & routes
    ├── jobs/            # Background jobs
    └── config/          # Database & seeding

```

## Prerequisites

- Node.js 18+
- MongoDB 6+

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file (see `.env.example`):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/checkout
```

## Database Setup

Seed the database with sample products and coupons:

```bash
npm run seed
```

This creates:
- 4 sample products (including D.O.N ISSUE #6 from the UI)
- 4 sample coupons (SAVE10, SAVE20, FLAT15, SUMMER25)

## Running the Project

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### POST `/api/checkout/initiate`

Start a new checkout session with 15-minute stock reservation.

**Request:**
```json
{
  "customerId": "customer123",
  "items": [
    {
      "productId": "BD23672983",
      "quantity": 1
    }
  ],
  "address": {
    "street": "82 Melora Street",
    "city": "Westbridge",
    "state": "CA",
    "country": "USA",
    "postalCode": "92841",
    "phone": "+1 (555) 1123-4456"
  }
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "customerId": "customer123",
  "items": [...],
  "address": {...},
  "status": "RESERVED",
  "totals": {
    "subtotal": { "amount": 123.38, "currency": "USD" },
    "discount": { "amount": 0, "currency": "USD" },
    "shippingCost": { "amount": 10, "currency": "USD" },
    "paymentFee": { "amount": 0, "currency": "USD" },
    "total": { "amount": 133.38, "currency": "USD" }
  },
  "reservationExpiresAt": "2025-12-05T10:30:00.000Z",
  "createdAt": "2025-12-05T10:15:00.000Z"
}
```

### POST `/api/checkout/:orderId/coupon`

Apply a coupon code to the order.

**Request:**
```json
{
  "couponCode": "SAVE10"
}
```

**Response:** Updated totals with discount applied

### PUT `/api/checkout/:orderId/payment-method`

Update payment method and recalculate fees.

**Request:**
```json
{
  "type": "PAYPAL",
  "installments": null
}
```

For Pay Later:
```json
{
  "type": "PAY_LATER",
  "installments": 4
}
```

**Response:** Updated totals with payment fees

### GET `/api/checkout/:orderId`

Retrieve complete order summary.

### POST `/api/checkout/:orderId/complete`

Complete the purchase (mark as paid).

**Response:**
```json
{
  "success": true,
  "orderId": "uuid",
  "message": "Payment processed successfully"
}
```

## Business Rules

### Shipping Costs
- **EU**: $4 for purchases < $100, free otherwise
- **USA**: $10 for purchases < $150, free otherwise
- **Other regions**: Not supported

### Payment Fees
- **PayPal**: 3.5% fee
- **Bank Transfer**: No fee
- **Pay Later**: 2% fee (requires 2+ installments)

### Coupons
- **Percentage**: Discount as % of subtotal (e.g., 10% off)
- **Fixed**: Fixed amount off (e.g., $15 off)
- Validates expiration date

### Stock Reservation
- 15-minute automatic lock when checkout initiated
- Background job runs every minute to release expired reservations
- Stock permanently reduced only after payment completion

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Tests cover:
- Domain services (pricing, shipping calculations)
- Business logic (coupons, fees, thresholds)
- Edge cases (expired reservations, invalid regions)

## Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

Key files:
- `src/index.ts` - Application entry point with dependency injection
- `src/domain/` - Core business logic (entities, value objects, services)
- `src/application/` - Use cases coordinating domain logic
- `src/infrastructure/` - External adapters (MongoDB, REST API, jobs)

## Development Notes

- **Clean Architecture**: Dependencies point inward (Infrastructure → Application → Domain)
- **Repository Pattern**: Domain defines interfaces, infrastructure implements
- **Value Objects**: Immutable objects like Money, Address enforce business rules
- **Aggregate Root**: Order entity manages consistency of its items
- **Domain Services**: Stateless services for complex calculations

## License

ISC
