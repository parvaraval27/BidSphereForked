import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';
import connectDB from './db.js';

dotenv.config();
export async function run() {
  await connectDB();
  try {
    const now = new Date();
    const expired = await Payment.find({ 
      status: { $in: ['PENDING', 'HOLD'] }, 
      expiry: { $lte: now } 
    });

    console.log(`Found ${expired.length} expired payment(s)`);

    for (const p of expired) {
      try {
        await Payment.findByIdAndUpdate(p._id, { 
          status: 'VOID', 
          providerStatus: 'expired' 
        });
        console.log('Marked VOID for', p.paymentId);
      } catch (err) {
        console.error('Error marking VOID for', p.paymentId, err);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}
const isMainModule = import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/') || 
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('voidExpiredHold.js')) {
  run().catch((e) => {
    console.error('voidExpiredHold failed', e);
    process.exit(1);
  });
}

