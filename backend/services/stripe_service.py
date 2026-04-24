import stripe
import os
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")
# Example price ID from Stripe dashboard for Pro Tier
PRO_PRICE_ID = os.environ.get("STRIPE_PRO_PRICE_ID", "price_YOUR_PRICE_ID")

def create_checkout_session(user_id: int, success_url: str, cancel_url: str):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': PRO_PRICE_ID,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=str(user_id) # Link payment to user
        )
        return session.url
    except Exception as e:
        raise Exception(f"Stripe Error: {str(e)}")

def verify_webhook(payload: bytes, sig_header: str):
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        return event
    except ValueError as e:
        # Invalid payload
        raise Exception("Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise Exception("Invalid signature")

def get_subscription(sub_id: str):
    try:
        sub = stripe.Subscription.retrieve(sub_id)
        return sub
    except Exception as e:
        raise Exception(f"Stripe Error: {str(e)}")
