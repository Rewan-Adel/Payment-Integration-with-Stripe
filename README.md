### Payment Integration with Stripe
This project handles user authentication, payment processing, and Stripe integration for a web application. The service allows users to make payments through Stripe, store their payment history, and handle various Stripe webhook events to manage the payment status in the database

## Features
- User Authentication: Manages user token and authentication.
- Payment History: Allows users to view their payment history.
- Stripe Integration:
  - Creates a Stripe session for user payments.
  - Handles the Stripe webhook for payment confirmation and updates the payment status.
  - Saves successful payment information to the database.
  - Handles payment failure scenarios.

## Webhook Events Handled
- **checkout.session.completed:** Triggered when a payment session is completed successfully. It updates the payment status and stores the payment details in the database.
- **payment_intent.succeeded:** Triggered when a payment intent is successfully processed.
- **checkout.session.async_payment_failed:**Triggered when a payment fails asynchronously. It updates the payment status accordingly.

## Database Schema
 # Payment Model
- **user:** User ID (reference to the user who made the payment)
- **payment_intent_id:** The ID from Stripe that identifies the payment intent
- **amount:** Amount of the payment in USD
- **currency:** Currency of the payment
- **cardholder_name:** Name of the cardholder
- **status:** Payment status (e.g., paid, pending, failed)
- **paid_at:** Date and time when the payment was completed
- **cancelled_at:** Date and time when the payment was canceled (if applicable)

## Tech Stack
- **Node.js:** JavaScript runtime for building the server-side application.
- **Express.js:** Web framework for handling API routes.
- **Stripe API:** For handling the payment processing and webhook events.
- **MongoDB:** Database for storing user and payment information.

