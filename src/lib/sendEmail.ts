export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Email API error:', errorData)
      throw new Error(errorData.error || 'Failed to send email')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error sending email:', error.message)
    // Don't throw - just log and continue
    return { success: false, error: error.message }
  }
}