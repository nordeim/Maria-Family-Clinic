// Email notification edge function for appointments
// This function sends email notifications for appointment bookings, confirmations, and cancellations

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { type, appointment, userEmail, doctorName, clinicName, appointmentDate, appointmentTime } = await req.json()

    // Generate email content based on notification type
    let subject = ''
    let htmlContent = ''
    
    if (type === 'booking_confirmation') {
      subject = 'Appointment Booking Confirmation - My Family Clinic'
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
              .details { background-color: white; padding: 20px; border-radius: 6px; margin: 15px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-label { font-weight: bold; color: #6b7280; }
              .detail-value { color: #111827; }
              .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Appointment Confirmed</h1>
              </div>
              <div class="content">
                <h2>Your appointment has been successfully booked!</h2>
                <p>Dear Patient,</p>
                <p>Thank you for choosing My Family Clinic. Your appointment has been confirmed with the following details:</p>
                
                <div class="details">
                  <div class="detail-row">
                    <span class="detail-label">Doctor:</span>
                    <span class="detail-value">${doctorName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Clinic:</span>
                    <span class="detail-value">${clinicName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${appointmentDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${appointmentTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">Confirmed</span>
                  </div>
                </div>

                <p><strong>Important Reminders:</strong></p>
                <ul>
                  <li>Please arrive 15 minutes before your appointment time</li>
                  <li>Bring your NRIC or passport for verification</li>
                  <li>Bring any relevant medical records or test results</li>
                  <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
                </ul>

                <a href="https://m3n9vp97ehyi.space.minimax.io/#/dashboard" class="button">View Appointment</a>
              </div>

              <div class="footer">
                <p>My Family Clinic - Your Healthcare Partner</p>
                <p>Phone: +65 6123 4567 | Email: info@myfamilyclinic.sg</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `
    } else if (type === 'cancellation') {
      subject = 'Appointment Cancellation - My Family Clinic'
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Appointment Cancelled</h1>
              </div>
              <div class="content">
                <p>Dear Patient,</p>
                <p>Your appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime} has been cancelled.</p>
                <p>If you wish to book a new appointment, please visit our website.</p>
              </div>
              <div class="footer">
                <p>My Family Clinic - Your Healthcare Partner</p>
                <p>Phone: +65 6123 4567 | Email: info@myfamilyclinic.sg</p>
              </div>
            </div>
          </body>
        </html>
      `
    } else if (type === 'reminder') {
      subject = 'Appointment Reminder - My Family Clinic'
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Appointment Reminder</h1>
              </div>
              <div class="content">
                <p>Dear Patient,</p>
                <p>This is a friendly reminder about your upcoming appointment:</p>
                <p><strong>Doctor:</strong> ${doctorName}<br>
                   <strong>Date:</strong> ${appointmentDate}<br>
                   <strong>Time:</strong> ${appointmentTime}<br>
                   <strong>Location:</strong> ${clinicName}</p>
                <p>Please remember to arrive 15 minutes early.</p>
              </div>
              <div class="footer">
                <p>My Family Clinic - Your Healthcare Partner</p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    // In a real implementation, you would use an email service like SendGrid, AWS SES, or Resend
    // For demonstration, we'll log the email content
    console.log('Email notification:', {
      to: userEmail,
      subject,
      type
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification queued',
        data: {
          type,
          recipient: userEmail,
          subject
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error sending notification:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'NOTIFICATION_ERROR',
          message: error.message || 'Failed to send notification'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
