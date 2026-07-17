// src/utils/deliverySlipGenerator.ts
export const generateDeliverySlipHTML = (slipData: any): string => {
  const {
    orderNumber,
    date,
    customer,
    items,
    totals,
    payment,
    tracking,
    notes,
    company
  } = slipData;

  const itemsRows = items.map((item: any, index: number) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <strong>${item.name}</strong><br>
        <small style="color: #666;">SKU: ${item.sku}</small>
        ${item.selectedColor?.name ? `<br><small style="color: #666;">Color: ${item.selectedColor.name}</small>` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">PKR ${item.price.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">PKR ${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Delivery Slip - ${orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #fff;
        }
        .slip-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #000;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          text-transform: uppercase;
        }
        .header h2 {
          margin: 5px 0;
          font-size: 20px;
          color: #333;
        }
        .company-info {
          text-align: center;
          margin-bottom: 20px;
          font-size: 12px;
          color: #666;
        }
        .section {
          margin-bottom: 20px;
          border: 1px solid #ddd;
          padding: 15px;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          background: #f0f0f0;
          padding: 5px 10px;
          border-left: 4px solid #000;
        }
        .customer-info {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 10px;
        }
        .label {
          font-weight: bold;
          color: #555;
        }
        .value {
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background: #f0f0f0;
          padding: 10px;
          text-align: left;
          font-size: 14px;
          border-bottom: 2px solid #000;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          padding: 5px 0;
        }
        .total-label {
          width: 150px;
          font-weight: bold;
        }
        .total-value {
          width: 150px;
          text-align: right;
        }
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 30px;
          border-top: 2px dashed #000;
          padding-top: 20px;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        .signature-line {
          width: 200px;
          border-bottom: 1px solid #000;
          margin-top: 5px;
        }
        .delivery-instructions {
          background: #fff9c4;
          padding: 10px;
          border: 1px solid #fbc02d;
          margin-top: 20px;
          font-size: 14px;
        }
        .print-button {
          text-align: center;
          margin: 20px 0;
        }
        .print-button button {
          background: #000;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          border-radius: 4px;
        }
        .print-button button:hover {
          background: #333;
        }
        @media print {
          .print-button {
            display: none;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-button">
        <button onclick="window.print()">🖨️ Print Delivery Slip</button>
      </div>

      <div class="slip-container">
        <!-- Header -->
        <div class="header">
          <h1>${company.name}</h1>
          <h2>DELIVERY SLIP / PACKING SLIP</h2>
          <div class="company-info">
            <p>${company.address} | Phone: ${company.phone} | Email: ${company.email}</p>
          </div>
        </div>

        <!-- Order Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <span class="label">Order #:</span>
            <span class="value" style="font-size: 18px; font-weight: bold;">${orderNumber}</span>
          </div>
          <div>
            <span class="label">Date:</span>
            <span class="value">${new Date(date).toLocaleDateString()}</span>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="section">
          <div class="section-title">👤 CUSTOMER INFORMATION</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <div class="label">Full Name</div>
              <div class="value" style="font-size: 16px;">${customer.name}</div>
            </div>
            <div>
              <div class="label">Phone Number</div>
              <div class="value" style="font-size: 16px; font-weight: bold;">${customer.phone}</div>
            </div>
            <div>
              <div class="label">Email</div>
              <div class="value">${customer.email || 'N/A'}</div>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="section">
          <div class="section-title">📍 DELIVERY ADDRESS</div>
          <div style="font-size: 16px; line-height: 1.6;">
            ${customer.address.street}<br>
            ${customer.address.city}, ${customer.address.postalCode}<br>
            ${customer.address.country}
          </div>
        </div>

        <!-- Order Items -->
        <div class="section">
          <div class="section-title">📦 ORDER ITEMS</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>

        <!-- Payment Summary -->
        <div class="section">
          <div class="section-title">💰 PAYMENT SUMMARY</div>
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">PKR ${totals.subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Shipping:</span>
              <span class="total-value">PKR ${totals.shipping.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span class="total-value">PKR ${totals.tax.toLocaleString()}</span>
            </div>
            ${totals.codCharges > 0 ? `
            <div class="total-row">
              <span class="total-label">COD Charges:</span>
              <span class="total-value">PKR ${totals.codCharges.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row grand-total">
              <span class="total-label">TOTAL AMOUNT:</span>
              <span class="total-value">PKR ${totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <span class="label">Payment Method:</span>
            <span class="value" style="font-weight: bold;">${payment.method.toUpperCase()}</span>
          </div>
          <div>
            <span class="label">Payment Status:</span>
            <span class="value" style="font-weight: bold; color: ${payment.status.includes('COD') ? '#f39c12' : payment.status === 'Paid' ? '#27ae60' : '#e74c3c'};">${payment.status}</span>
          </div>
        </div>

        <!-- Tracking Info -->
        ${tracking ? `
        <div style="background: #e1f5fe; padding: 10px; border: 1px solid #4fc3f7; margin-bottom: 20px;">
          <span class="label">Tracking #:</span>
          <span class="value" style="font-weight: bold;">${tracking.number}</span>
          <span style="margin-left: 20px;" class="label">Carrier:</span>
          <span class="value">${tracking.carrier}</span>
        </div>
        ` : ''}

        <!-- Delivery Instructions / Notes -->
${notes ? `
<div class="delivery-instructions">
  <strong>📝 Delivery Instructions:</strong><br>
  <div style="white-space: pre-line; margin-top: 5px;">
    ${notes.split('\\n').map(line => line.trim()).filter(line => line).join('<br>')}
  </div>
</div>
` : ''}

        <!-- Footer with Signatures -->
        <div class="footer">
          <div style="text-align: center; margin-bottom: 20px;">
            <strong>*** THIS SLIP MUST ACCOMPANY THE DELIVERY ***</strong>
          </div>

          <div class="signature-section">
            <div>
              <div class="label">Delivery Boy Signature</div>
              <div class="signature-line"></div>
            </div>
            <div>
              <div class="label">Customer Signature</div>
              <div class="signature-line"></div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
            <p>This is a computer generated slip and does not require a stamp.</p>
            <p>For any queries, contact ${company.phone} or ${company.email}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};