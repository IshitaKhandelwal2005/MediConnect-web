import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center'>
                <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg className='w-8 h-8 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                    </svg>
                </div>
                <h2 className='text-2xl font-semibold text-yellow-600 mb-2'>Payment Cancelled</h2>
                <p className='text-gray-600 mb-6'>You cancelled the payment process. Your appointment is still pending payment.</p>
                <div className='flex flex-col gap-3'>
                    <button
                        onClick={() => navigate('/my-appointments')}
                        className='bg-[#002000] text-white rounded-full px-6 py-3 hover:bg-[#003300] transition-colors'
                    >
                        View My Appointments
                    </button>
                    <button
                        onClick={() => navigate('/doctors')}
                        className='text-gray-600 hover:text-gray-800 transition-colors'
                    >
                        Browse Doctors
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
