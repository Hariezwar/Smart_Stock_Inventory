import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..core import config


def _get_mail_settings():
    smtp_host = config.get_env("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(config.get_env("SMTP_PORT", "587"))
    smtp_user = config.get_env("SMTP_USER")
    smtp_password = config.get_env("SMTP_PASSWORD")
    alert_recipient = config.get_env("ALERT_RECIPIENT", "admin@inventix.io")
    frontend_url = config.get_env("FRONTEND_URL", "http://127.0.0.1:5173")
    return {
        "smtp_host": smtp_host,
        "smtp_port": smtp_port,
        "smtp_user": smtp_user,
        "smtp_password": smtp_password,
        "alert_recipient": alert_recipient,
        "frontend_url": frontend_url.rstrip("/"),
    }


def _validate_mail_settings(settings):
    missing = [
        name
        for name, value in (
            ("SMTP_USER", settings["smtp_user"]),
            ("SMTP_PASSWORD", settings["smtp_password"]),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(
            f"Missing email configuration: {', '.join(missing)}. "
            "Add them to backend/.env or your shell environment before sending mail."
        )


def send_low_stock_alert(
    recipient: str,
    supplier_name: str,
    product_name: str,
    stock: int,
    reorder_level: int,
    suggested_order: int,
):
    """Send a low-stock email alert to the assigned supplier."""
    try:
        settings = _get_mail_settings()
        _validate_mail_settings(settings)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Low Stock Alert: {product_name}"
        msg["From"] = settings["smtp_user"]
        msg["To"] = recipient

        review_link = f"{settings['frontend_url']}/products"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); padding: 24px; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Low Stock Alert</h1>
                <p style="margin: 4px 0 0; opacity: 0.85;">Inventix Smart Inventory Optimizer</p>
              </div>
              <div style="padding: 24px;">
                <p>Hello {supplier_name},</p>
                <p style="color: #64748b;">The following product has fallen below its reorder threshold and may need replenishment:</p>
                <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background: #f1f5f9;"><td style="padding: 12px; font-weight: bold;">Product</td><td style="padding: 12px;">{product_name}</td></tr>
                  <tr><td style="padding: 12px; font-weight: bold;">Current Stock</td><td style="padding: 12px; color: #ef4444; font-weight: bold;">{stock} units</td></tr>
                  <tr style="background: #f1f5f9;"><td style="padding: 12px; font-weight: bold;">Reorder Level</td><td style="padding: 12px;">{reorder_level} units</td></tr>
                  <tr><td style="padding: 12px; font-weight: bold;">Suggested Order</td><td style="padding: 12px; color: #10b981; font-weight: bold;">{suggested_order} units</td></tr>
                </table>
                <p>Please reply to confirm replenishment options and delivery timing.</p>
                <a href="{review_link}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review in Inventix</a>
              </div>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings["smtp_host"], settings["smtp_port"]) as server:
            server.starttls()
            server.login(settings["smtp_user"], settings["smtp_password"])
            server.sendmail(settings["smtp_user"], recipient, msg.as_string())
        return True
    except Exception as exc:
        print(f"Email alert error: {exc}")
        return False


def _send_html_email(subject: str, recipient: str, html: str):
    settings = _get_mail_settings()
    _validate_mail_settings(settings)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings["smtp_user"]
    msg["To"] = recipient
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings["smtp_host"], settings["smtp_port"]) as server:
        server.starttls()
        server.login(settings["smtp_user"], settings["smtp_password"])
        server.sendmail(settings["smtp_user"], recipient, msg.as_string())


def send_password_reset_email(recipient: str, username: str, reset_token: str):
    settings = _get_mail_settings()
    reset_link = f"{settings['frontend_url']}/reset-password?token={reset_token}"
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1A3D63, #4B8BBE); padding: 24px; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Reset your Inventix password</h1>
            <p style="margin: 4px 0 0; opacity: 0.85;">This link expires in 30 minutes.</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p>Hello {username},</p>
            <p>We received a request to reset your password. If this was you, use the button below to choose a new password.</p>
            <p style="margin: 24px 0;">
              <a href="{reset_link}" style="display: inline-block; background: #1A3D63; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset password</a>
            </p>
            <p>If the button does not work, copy and paste this link into your browser:</p>
            <p><a href="{reset_link}" style="color: #1A3D63;">{reset_link}</a></p>
            <p>If you did not request this, you can ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
    """
    _send_html_email("Reset your Inventix password", recipient, html)


def send_purchase_order_email(
    recipient: str,
    supplier_name: str,
    product_name: str,
    sku: str,
    quantity: int,
    unit_cost: float,
    total_cost: float,
    created_by: str,
):
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #0A1931, #1A3D63); padding: 24px; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New purchase order request</h1>
            <p style="margin: 4px 0 0; opacity: 0.85;">Inventix procurement workflow</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p>Hello {supplier_name},</p>
            <p>Please supply the following inventory item:</p>
            <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f1f5f9;"><td style="padding: 12px; font-weight: bold;">Product</td><td style="padding: 12px;">{product_name}</td></tr>
              <tr><td style="padding: 12px; font-weight: bold;">SKU</td><td style="padding: 12px;">{sku}</td></tr>
              <tr style="background: #f1f5f9;"><td style="padding: 12px; font-weight: bold;">Requested quantity</td><td style="padding: 12px;">{quantity}</td></tr>
              <tr><td style="padding: 12px; font-weight: bold;">Unit cost</td><td style="padding: 12px;">${unit_cost:,.2f}</td></tr>
              <tr style="background: #f1f5f9;"><td style="padding: 12px; font-weight: bold;">Estimated total</td><td style="padding: 12px;">${total_cost:,.2f}</td></tr>
            </table>
            <p>Requested by: <strong>{created_by}</strong></p>
            <p>Please reply to confirm availability and fulfillment timing.</p>
          </div>
        </div>
      </body>
    </html>
    """
    _send_html_email(f"Purchase order request for {product_name}", recipient, html)
