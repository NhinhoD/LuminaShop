import { OrderConfirmationEmailDTO } from '@/domain/services/IEmailService';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 25000);
}

export function generateOrderConfirmationEmail(data: OrderConfirmationEmailDTO): {
  subject: string;
  html: string;
  text: string;
} {
  const isVi = data.locale === 'vi';
  const isEn = !isVi;
  const shortOrderId = data.orderId.split('-')[0].toUpperCase();
  const formattedTotal = isVi ? formatVND(data.totalAmount) : formatUSD(data.totalAmount);

  const subject = isVi
    ? `[KhoUI] Xác nhận đơn hàng #${shortOrderId} & Cấp mã bản quyền mã nguồn`
    : `[KhoUI] Order Confirmation #${shortOrderId} & Digital License Key`;

  const itemsHtml = data.items
    .map((item) => {
      const downloadBtn = item.sourceCodeUrl
        ? `<a href="${item.sourceCodeUrl}" style="display:inline-block;padding:9px 18px;background-color:#0051d5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">${isVi ? 'Tải mã nguồn (ZIP)' : 'Download Source (ZIP)'}</a>`
        : `<span style="font-size:12px;color:#64748b;">${isVi ? 'Link tải khả dụng trong trang quản lý tài khoản' : 'Download available in your account dashboard'}</span>`;

      return `
        <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <h3 style="margin:0 0 6px 0;color:#0f172a;font-size:15px;font-weight:700;">${item.productTitle}</h3>
                <div style="margin-bottom:12px;">
                  <span style="display:inline-block;background-color:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;">${isVi ? 'Bản quyền trọn đời' : 'Lifetime License'}</span>
                  <span style="font-size:13px;color:#0f172a;font-weight:700;float:right;">${isVi ? formatVND(item.price) : formatUSD(item.price)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div style="background-color:#ffffff;border:1px dashed #cbd5e1;border-radius:8px;padding:10px 12px;margin-bottom:12px;">
                  <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:4px;">${isVi ? 'MÃ BẢN QUYỀN (LICENSE KEY):' : 'ACTIVATION LICENSE KEY:'}</div>
                  <div style="font-family:monospace;font-size:14px;color:#0051d5;font-weight:700;letter-spacing:1px;">${item.licenseKey}</div>
                </div>
                <div>
                  ${downloadBtn}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#090d16;padding:32px 32px 28px 32px;text-align:center;">
              <div style="display:inline-block;padding:4px 12px;background-color:rgba(0,81,213,0.25);border:1px solid rgba(0,81,213,0.4);border-radius:9999px;color:#60a5fa;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
                ${isVi ? 'CHỨNG NHẬN BẢN QUYỀN & MÃ NGUỒN' : 'DIGITAL LICENSE CERTIFICATE'}
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">KhoUI Marketplace</h1>
              <p style="margin:6px 0 0 0;color:#94a3b8;font-size:13px;">${isVi ? 'Nền tảng Giao diện & Template Website Bản quyền Cao cấp' : 'Premium Website Templates & Component Ecosystem'}</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;color:#0f172a;line-height:1.6;">
                ${isVi ? `Kính gửi <strong>${data.customerName || 'Quý khách'}</strong>,` : `Dear <strong>${data.customerName || 'Customer'}</strong>,`}
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;color:#475569;line-height:1.6;">
                ${isVi
                  ? `Cảm ơn bạn đã tin tưởng lựa chọn sản phẩm tại KhoUI. Giao dịch cho đơn hàng <strong>#${shortOrderId}</strong> đã hoàn tất thành công. Dưới đây là mã bản quyền và liên kết tải mã nguồn của bạn:`
                  : `Thank you for choosing KhoUI. Your payment for order <strong>#${shortOrderId}</strong> was successful. Here are your digital license credentials and source code downloads:`}
              </p>

              <!-- Order Summary Header -->
              <div style="border-bottom:2px solid #f1f5f9;padding-bottom:8px;margin-bottom:16px;">
                <span style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
                  ${isVi ? 'DANH SÁCH MÃ NGUỒN ĐÃ MUA' : 'LICENSED TEMPLATES'}
                </span>
              </div>

              <!-- Product Items -->
              ${itemsHtml}

              <!-- Total Calculation -->
              <div style="background-color:#f8fafc;border-radius:12px;padding:16px;margin:24px 0 20px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:14px;color:#64748b;font-weight:600;">${isVi ? 'Tổng thanh toán:' : 'Total Amount Paid:'}</td>
                    <td align="right" style="font-size:18px;color:#0051d5;font-weight:800;font-family:monospace;">${formattedTotal}</td>
                  </tr>
                </table>
              </div>

              <!-- Important Notes -->
              <div style="border-left:3px solid #0051d5;background-color:#eff6ff;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <h4 style="margin:0 0 4px 0;color:#1e40af;font-size:12px;font-weight:700;">${isVi ? 'Lưu ý về bản quyền:' : 'License Terms & Notice:'}</h4>
                <p style="margin:0;font-size:12px;color:#1e3a8a;line-height:1.5;">
                  ${isVi
                    ? 'Mỗi mã bản quyền được cấp quyền sử dụng thương mại vĩnh viễn cho 01 lập trình viên / dự án. Vui lòng lưu trữ email này để được hỗ trợ kỹ thuật và nhận các bản cập nhật trong tương lai.'
                    : 'Each license grant provides lifetime commercial usage for single-developer applications. Please retain this email for technical support and ongoing updates.'}
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
                ${isVi
                  ? 'Nếu cần hỗ trợ kỹ thuật hoặc có bất kỳ câu hỏi nào, vui lòng phản hồi trực tiếp email này hoặc liên hệ qua'
                  : 'For technical inquiries or custom licensing, please reply directly to this email or reach us at'}
                <a href="mailto:contact@khoui.com" style="color:#0051d5;text-decoration:underline;">contact@khoui.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#64748b;font-weight:600;">KhoUI — The Curated Template Experience</p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">© 2026 KhoUI Inc. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const greeting = isEn
    ? `Dear ${data.customerName || 'Valued Customer'},`
    : `Kính gửi ${data.customerName || 'Quý khách'},`;

  const thankYou = isEn
    ? `Thank you for choosing KhoUI. The transaction for order #${shortOrderId} is complete.`
    : `Cảm ơn bạn đã mua sắm tại KhoUI. Giao dịch cho đơn hàng #${shortOrderId} đã hoàn tất.`;

  const totalLabel = isEn ? 'Total Paid' : 'Tổng thanh toán';
  const licensesLabel = isEn ? 'Your Digital Licenses & Source Code:' : 'Danh sách bản quyền:';
  const licenseKeyLabel = isEn ? 'License Key' : 'Mã bản quyền';
  const downloadLabel = isEn ? 'Download Link' : 'Link tải mã nguồn';
  const downloadFallback = isEn ? 'Access via your KhoUI account' : 'Xem trong tài khoản KhoUI';
  const supportLabel = isEn ? 'Technical Support' : 'Hỗ trợ kỹ thuật';

  const text = `
KhoUI - ${subject}

${greeting}
${thankYou}

${totalLabel}: ${formattedTotal}

${licensesLabel}
${data.items
  .map(
    (item) => `
- ${item.productTitle}
  ${licenseKeyLabel}: ${item.licenseKey}
  ${downloadLabel}: ${item.sourceCodeUrl || downloadFallback}
`
  )
  .join('\n')}

${supportLabel}: contact@khoui.com
© 2026 KhoUI Marketplace.
  `.trim();

  return { subject, html, text };
}