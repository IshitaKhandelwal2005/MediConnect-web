import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripePayment = ({ appointmentId, amount, doctorName, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            // Create checkout session
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/create-stripe-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: token
                },
                body: JSON.stringify({ appointmentId })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to Stripe checkout
                window.location.href = data.session_url;
            } else {
                setError(data.message);
                setLoading(false);
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className='bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto'>
            <h2 className='text-xl font-semibold mb-4 text-[#002000]'>Complete Payment</h2>
            
            <div className='space-y-3 mb-6'>
                <div className='flex justify-between text-gray-600'>
                    <span>Doctor:</span>
                    <span className='font-medium'>{doctorName}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                    <span>Amount:</span>
                    <span className='font-medium text-lg'>${amount}</span>
                </div>
            </div>

            {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4'>
                    {error}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading}
                className='w-full bg-[#002000] text-white rounded-full py-3 font-medium hover:bg-[#003300] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
                {loading ? 'Processing...' : 'Pay with Stripe'}
            </button>

            {onCancel && (
                <button
                    onClick={onCancel}
                    className='w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors'
                >
                    Cancel
                </button>
            )}
        </div>
    );
};

export default StripePayment;
