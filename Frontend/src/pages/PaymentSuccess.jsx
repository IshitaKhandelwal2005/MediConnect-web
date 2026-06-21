import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { backendUrl } = useAppContext();
  const { token } = useAuthContext();;
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const session_id = searchParams.get('session_id');
                const appointment_id = searchParams.get('appointment_id');

                if (!session_id || !appointment_id) {
                    toast.error('Invalid payment verification');
                    navigate('/my-appointments');
                    return;
                }

                const { data } = await axios.post(
                    backendUrl + '/api/payment/verify-stripe-payment',
                    { session_id, appointment_id },
                    { headers: { token } }
                );

                if (data.success) {
                    setVerified(true);
                    toast.success('Payment successful!');
                } else {
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                console.log(error);
                toast.error('Payment verification failed');
            } finally {
                setVerifying(false);
            }
        };

        if (token) {
            verifyPayment();
        }
    }, [token]);

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center'>
                {verifying ? (
                    <div>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#002000] mx-auto mb-4'></div>
                        <p className='text-gray-600'>Verifying payment...</p>
                    </div>
                ) : verified ? (
                    <div>
                        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-8 h-8 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                            </svg>
                        </div>
                        <h2 className='text-2xl font-semibold text-[#002000] mb-2'>Payment Successful!</h2>
                        <p className='text-gray-600 mb-6'>Your appointment has been confirmed.</p>
                        <button
                            onClick={() => navigate('/my-appointments')}
                            className='bg-[#002000] text-white rounded-full px-6 py-3 hover:bg-[#003300] transition-colors'
                        >
                            View My Appointments
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-8 h-8 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </div>
                        <h2 className='text-2xl font-semibold text-red-600 mb-2'>Payment Failed</h2>
                        <p className='text-gray-600 mb-6'>There was an issue verifying your payment.</p>
                        <button
                            onClick={() => navigate('/my-appointments')}
                            className='bg-[#002000] text-white rounded-full px-6 py-3 hover:bg-[#003300] transition-colors'
                        >
                            View My Appointments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
