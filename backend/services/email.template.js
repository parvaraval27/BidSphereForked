export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
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
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;




export const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Community</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
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
              background-color: #007BFF;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
    <div class="container">
        <div class="header">Welcome to BidSphere!</div>
        <div class="content">
            <p class="welcome-message">Hello {name},</p>
            <p>We’re excited to have you on BidSphere, your online auction platform! Your registration was successful, and you can now start exploring and bidding on amazing items.</p>
            <p>Here’s how you can get started:</p>
            <ul>
                <li>Browse auctions and find items you love.</li>
                <li>Place bids and track your auctions.</li>
                <body>
    <div class="container">
        <div class="header">Welcome to BidSphere!</div>
        <div class="content">
            <p class="welcome-message">Hello {name},</p>
            <p>We’re excited to have you on BidSphere, your online auction platform! Your registration was successful, and you can now start exploring and bidding on amazing items.</p>
            <p>Here’s how you can get started:</p>
            <ul>
                <li>Browse auctions and find items you love.</li>
                <li>Place bids and track your auctions.</li>
                <li>Contact our support team if you need any help.</li>
            </ul>
            <a href="#" class="button">Start Bidding Now</a>
            <p>If you have any questions or need assistance, our team is here to help you every step of the way. Happy bidding!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>

            </ul>
            <a href="#" class="button">Start Bidding Now</a>
            <p>If you have any questions or need assistance, our team is here to help you every step of the way. Happy bidding!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
  </html>
`;
