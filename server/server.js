import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

// Fail fast with a helpful message when STRIPE_SECRET_KEY is missing
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_XXXXXXXXXXXXXXXX')) {
  console.error('\nERROR: STRIPE_SECRET_KEY is not set correctly in server/.env.');
  console.error('Please open server/.env and add your Stripe test secret key (sk_test_...).');
  console.error('Example: STRIPE_SECRET_KEY=sk_test_ABC123...\n');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    // Example payload from client: { items: [{ price: 'price_123', quantity: 1 }] }
    const { items } = req.body;

    // Build line_items to support either a Stripe price ID (price_...) or a product ID (prod_...)
    const line_items = items.map((item) => {
      // If client passed a Stripe price ID, pass through directly
      if (item.price && String(item.price).startsWith('price_')) {
        return { price: item.price, quantity: item.quantity };
      }

      // If client passed a product ID (prod_...), use price_data with the supplied unit amount (in dollars)
      if (item.price && String(item.price).startsWith('prod_')) {
        const unit_amount_dollars = item.unit_amount || item.unitAmount || item.unitAmountCents || null;
        if (unit_amount_dollars == null) {
          throw new Error('unit_amount is required when sending a product ID; send dollars as a number (e.g. 29.99)');
        }
        const unit_amount = Math.round(Number(unit_amount_dollars) * 100); // convert to cents
        return {
          price_data: {
            currency: process.env.CURRENCY || 'usd',
            unit_amount,
            product: item.price,
          },
          quantity: item.quantity,
        };
      }

      // Fallback: if caller already supplied price_data shape, use it
      if (item.price_data) {
        return item.price_data;
      }

      throw new Error('Invalid item format. Provide either price (price_... or prod_...) or price_data');
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      // Optional: collect shipping
      shipping_address_collection: { allowed_countries: ['US', 'GB', 'CA', 'EU'] },
      // Optional: tax behavior if you have Stripe Tax
      // automatic_tax: { enabled: true },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// (Optional) Webhook for fulfillment (stub)
// Fetch all products with prices
app.get('/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      expand: ['data.default_price'],
      active: true,
    });
    res.json(products.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // You'll verify signatures here and act on checkout.session.completed
  res.sendStatus(200);
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
