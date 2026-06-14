import express from 'express'
import { createStripeCheckout, verifyStripePayment } from '../controllers/paymentController.js'
import authUser from '../middleware/authUser.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-stripe-checkout', authUser, createStripeCheckout)
paymentRouter.post('/verify-stripe-payment', authUser, verifyStripePayment)

export default paymentRouter
