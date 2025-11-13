import QRCode from 'qrcode';
function paiseToDecimal(amountPaise) {
  return (amountPaise / 100).toFixed(2); 
}

export function buildUpiDeepLink({ payeeVpa, payeeName = '', amountPaise, note = '' }) {
  if (!payeeVpa) throw new Error('payeeVpa required');
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) throw new Error('amountPaise must be integer > 0');
  
  const am = paiseToDecimal(amountPaise);
  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am,
    cu: 'INR',
    tn: note,
  });
  
  return `upi://pay?${params.toString()}`;
}

export function buildUpiQrData({ payeeVpa, payeeName = '', amountPaise, note = '' }) {
  const am = paiseToDecimal(amountPaise);
  const qrString = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(am)}&cu=INR&tn=${encodeURIComponent(note)}`;
  return qrString;
}

export async function qrToDataUrl(qrData) {
  return await QRCode.toDataURL(qrData);
}

