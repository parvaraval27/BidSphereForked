const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, "");

export const Auction_Winner_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auction Winner</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0; padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #673AB7;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px; color: #333; line-height: 1.8;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            margin: 10px 10px 0 0;
            background-color: #2196F3;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .button.cod { background-color: #FF9800; }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">🎉 You Won the Auction!</div>

        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>

            <p>Congratulations! You have won the auction for:</p>
            <p><strong>Auction:</strong> {auctionName}</p>

            <p>Please choose a payment method within <strong>24 hours</strong>:</p>

            <a href="${BACKEND_URL}/bidsphere/auctions/${'{auctionId}'}/finalpay/upi" class="button">UPI Payment</a>
            <a href="${BACKEND_URL}/5000/bidsphere/auctions/${'{auctionId}'}/finalpay/cod" class="button cod">Cash on Delivery (COD)</a>

            <p>If no payment option is selected in time, the order will be cancelled.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;