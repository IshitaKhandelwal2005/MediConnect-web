import stripe from '../config/stripe.js';
import appointmentModel from '../models/appointmentModel.js';

// Create Stripe checkout session
const createStripeCheckout = async (req, res) => {
    try {
        if (!stripe) {
            return res.json({ success: false, message: "Stripe is not configured. Please check STRIPE_SECRET_KEY in .env" });
        }

        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Appointment with Dr. ${appointmentData.docData.name}`,
                        description: `Date: ${appointmentData.slotDate} at ${appointmentData.slotTime}`,
                    },
                    unit_amount: appointmentData.amount * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?appointment_id=${appointmentId}`,
            metadata: {
                appointmentId: appointmentId,
            },
        });

        res.json({ success: true, session_url: session.url, session_id: session.id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Stripe payment and update appointment
const verifyStripePayment = async (req, res) => {
    try {
        if (!stripe) {
            return res.json({ success: false, message: "Stripe is not configured. Please check STRIPE_SECRET_KEY in .env" });
        }

        const { session_id, appointment_id } = req.body;

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            await appointmentModel.findByIdAndUpdate(appointment_id, { payment: true });
            res.json({ success: true, message: "Payment verified" });
        } else {
            res.json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export { createStripeCheckout, verifyStripePayment};
