import Payment from '../models/Payment.js';
import * as upiService from '../services/upiService.js';

export const createOrder = async (req, res) => {
  try {
    const {
      amount,
      auctionId,
      bidderId,
      payeeVpa,
      payeeName = '',
      note = '',
      expiryMinutes = 60 * 24 * 7,
    } = req.body;

    if (!Number.isInteger(amount) || amount <= 0 || !auctionId || !bidderId || !payeeVpa) {
      return res.status(400).json({
        error: 'Missing or invalid params: amount (paise integer), auctionId, bidderId, payeeVpa required',
      });
    }

    // Create a local ledger entry first (status PENDING)
    const requestId = `upi_req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const payment = new Payment({
      paymentId: requestId,
      provider: 'upi',
      amount,
      auctionId,
      bidderId,
      status: 'PENDING',
      providerStatus: 'pending',
      expiry,
      metadata: { payeeVpa, payeeName, note },
    });

    await payment.save();

    const upiLink = upiService.buildUpiDeepLink({
      payeeVpa,
      payeeName,
      amountPaise: amount,
      note,
    });

    const qrData = upiService.buildUpiQrData({
      payeeVpa,
      payeeName,
      amountPaise: amount,
      note,
    });

    const qrBase64 = await upiService.qrToDataUrl(qrData);

    return res.status(201).json({
      success: true,
      paymentId: payment.paymentId,
      upiLink,
      qrBase64,
      amount: payment.amount,
      status: payment.status,
      expiry: payment.expiry,
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        auctionId: payment.auctionId,
        bidderId: payment.bidderId,
        expiry: payment.expiry,
      },
    });
  } catch (err) {
    console.error('paymentController.createOrder error:', err);
    return res.status(500).json({ error: err.message || 'Create UPI request failed' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, upiTxnId, paidAmountPaise } = req.body;

    if (!paymentId || !upiTxnId || !Number.isInteger(paidAmountPaise) || paidAmountPaise <= 0) {
      return res.status(400).json({ error: 'Missing params: paymentId, upiTxnId, paidAmountPaise required' });
    }

    const ledger = await Payment.findOne({ paymentId });

    if (!ledger) return res.status(404).json({ error: 'Payment ledger not found' });

    if (ledger.amount !== paidAmountPaise) {
      return res.status(400).json({ error: 'Paid amount does not match ledger amount' });
    }

    if (ledger.status === 'CAPTURED') {
      return res.status(200).json({ ok: true, message: 'Payment already captured', ledger });
    }

    if (ledger.status === 'VOID') {
      return res.status(400).json({ error: 'Cannot verify a voided payment' });
    }

    ledger.status = 'CAPTURED';
    ledger.provider = 'upi';
    ledger.providerStatus = 'captured';
    ledger.metadata = { ...ledger.metadata, upiTxnId, verifiedAt: new Date().toISOString() };
    await ledger.save();

    return res.json({ ok: true, message: 'Payment verified successfully', ledger });
  } catch (err) {
    console.error('paymentController.verifyPayment error:', err);
    return res.status(500).json({ error: err.message || 'verifyPayment failed' });
  }
};

export const capturePayment = async (req, res) => {
  try {
    const { paymentId, paidAmountPaise, upiTxnId = null } = req.body;

    if (!paymentId || !Number.isInteger(paidAmountPaise) || paidAmountPaise <= 0) {
      return res.status(400).json({ error: 'Missing paymentId or invalid paidAmountPaise' });
    }

    const ledger = await Payment.findOne({ paymentId });

    if (!ledger) return res.status(404).json({ error: 'Payment ledger not found' });

    if (ledger.status === 'CAPTURED') {
      return res.status(200).json({ ok: true, message: 'Already captured', ledger });
    }

    if (ledger.status === 'VOID') {
      return res.status(400).json({ error: 'Cannot capture a voided payment' });
    }

    ledger.status = 'CAPTURED';
    ledger.providerStatus = 'captured';
    if (upiTxnId) {
      ledger.metadata = { ...ledger.metadata, upiTxnId, capturedAt: new Date().toISOString() };
    } else {
      ledger.metadata = { ...ledger.metadata, capturedAt: new Date().toISOString() };
    }
    await ledger.save();

    return res.json({ ok: true, message: 'Payment captured successfully', ledger });
  } catch (err) {
    console.error('paymentController.capturePayment error:', err);
    return res.status(500).json({ error: err.message || 'capturePayment failed' });
  }
};


export const voidPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

    const ledger = await Payment.findOne({ paymentId });

    if (!ledger) return res.status(404).json({ error: 'Payment ledger not found' });

    if (ledger.status === 'CAPTURED') {
      return res.status(400).json({ error: 'Cannot void a captured payment' });
    }

    ledger.status = 'VOID';
    ledger.providerStatus = 'voided';
    await ledger.save();

    return res.json({ ok: true, ledger });
  } catch (err) {
    console.error('paymentController.voidPayment error:', err);
    return res.status(500).json({ error: err.message || 'voidPayment failed' });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if payment has expired
    const isExpired = payment.expiry && new Date() > payment.expiry;
    if (isExpired && payment.status === 'PENDING') {
      payment.status = 'VOID';
      payment.providerStatus = 'expired';
      await payment.save();
    }

    return res.json({
      paymentId: payment.paymentId,
      status: payment.status,
      providerStatus: payment.providerStatus,
      amount: payment.amount,
      auctionId: payment.auctionId,
      bidderId: payment.bidderId,
      expiry: payment.expiry,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  } catch (err) {
    console.error('paymentController.getPaymentStatus error:', err);
    return res.status(500).json({ error: err.message || 'Get payment status failed' });
  }
};

export const createCodOrder = async (req, res) => {
  try {
    const {
      amount,
      auctionId,
      bidderId,
      deliveryAddress = '',
      contactPhone = '',
      note = '',
    } = req.body;

    if (!Number.isInteger(amount) || amount <= 0 || !auctionId || !bidderId) {
      return res.status(400).json({
        error: 'Missing or invalid params: amount (paise integer), auctionId, bidderId required',
      });
    }

    const paymentId = `cod_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const payment = new Payment({
      paymentId,
      provider: 'cod',
      amount,
      auctionId,
      bidderId,
      status: 'PENDING', 
      providerStatus: 'pending',
      metadata: { deliveryAddress, contactPhone, note },
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: payment.status,
      provider: payment.provider,
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        auctionId: payment.auctionId,
        bidderId: payment.bidderId,
        provider: payment.provider,
      },
    });
  } catch (err) {
    console.error('paymentController.createCodOrder error:', err);
    return res.status(500).json({ error: err.message || 'Create COD order failed' });
  }
};

export const listPayments = async (req, res) => {
  try {
    const { status, auctionId, bidderId, provider, limit = 50, page = 1 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (auctionId) filter.auctionId = auctionId;
    if (bidderId) filter.bidderId = bidderId;
    if (provider) filter.provider = provider;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Payment.countDocuments(filter);
    return res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('paymentController.listPayments error:', err);
    return res.status(500).json({ error: err.message || 'List payments failed' });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json({
      success: true,
      payment: payment.toObject(),
    });
  } catch (err) {
    console.error('paymentController.getPaymentDetails error:', err);
    return res.status(500).json({ error: err.message || 'Get payment details failed' });
  }
};

