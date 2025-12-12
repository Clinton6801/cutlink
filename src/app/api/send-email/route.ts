import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, type } = body

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'CutLink <onboarding@resend.dev>', // Use resend's test domain for now
      to: to,
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}