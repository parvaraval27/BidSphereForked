import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true }, 
  provider: { type: String, enum: ['upi', 'cod'], default: 'upi' },
  amount: { type: Number, required: true },
  auctionId: { type: String, required: true },
  bidderId: { type: String, required: true },
  status: { type: String, enum: ['PENDING','HOLD','CAPTURED','VOID','FAILED'], default: 'PENDING' },
  providerStatus: { type: String },
  expiry: { type: Date },
  metadata: { type: Object },
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;

