// Save as: src/lib/paystack.ts
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_SITE_URL; // Your live domain
};

// Then update the initializePayment function:
export const PAYSTACK_CONFIG = {
  // Test keys (use these for development)
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxx',
  
  // Platform commission (10%)
  COMMISSION_RATE: 0.10, // 10% = 0.10
  
  // Currency
  currency: 'NGN',
  
  // Paystack charges 1.5% + ₦100 per transaction
  PAYSTACK_FEE_PERCENTAGE: 0.015,
  PAYSTACK_FEE_FLAT: 100,
  
  // Minimum payout amount for stylists
  MIN_PAYOUT_AMOUNT: 1000, // ₦1,000
}

// Calculate Paystack fees
export function calculatePaystackFee(amount: number): number {
  const percentageFee = amount * PAYSTACK_CONFIG.PAYSTACK_FEE_PERCENTAGE
  const totalFee = percentageFee + PAYSTACK_CONFIG.PAYSTACK_FEE_FLAT
  
  // Paystack fees are capped at ₦2,000
  return Math.min(totalFee, 2000)
}

// Calculate platform commission
export function calculateCommission(amount: number): number {
  return Math.round(amount * PAYSTACK_CONFIG.COMMISSION_RATE)
}

// Calculate stylist payout (amount - commission - paystack fees)
export function calculateStylistPayout(bookingAmount: number): {
  bookingAmount: number
  paystackFee: number
  platformCommission: number
  stylistPayout: number
} {
  const paystackFee = calculatePaystackFee(bookingAmount)
  const platformCommission = calculateCommission(bookingAmount)
  const stylistPayout = bookingAmount - platformCommission - paystackFee
  
  return {
    bookingAmount,
    paystackFee: Math.round(paystackFee),
    platformCommission,
    stylistPayout: Math.round(stylistPayout)
  }
}

// Initialize Paystack payment
export async function initializePayment(data: {
  email: string
  amount: number // in kobo (multiply by 100)
  reference: string
  metadata?: any
}): Promise<any> {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        reference: data.reference,
        currency: PAYSTACK_CONFIG.currency,
        metadata: data.metadata,
        callback_url: `${getBaseUrl()}/api/payment/verify`
      })
    })

    const result = await response.json()
    
    if (!result.status) {
      throw new Error(result.message || 'Payment initialization failed')
    }

    return result.data
  } catch (error: any) {
    console.error('Paystack initialization error:', error)
    throw error
  }
}

// Verify payment
export async function verifyPayment(reference: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        }
      }
    )

    const result = await response.json()
    
    if (!result.status) {
      throw new Error(result.message || 'Payment verification failed')
    }

    return result.data
  } catch (error: any) {
    console.error('Paystack verification error:', error)
    throw error
  }
}

// Create transfer recipient (for payouts)
export async function createTransferRecipient(data: {
  type: 'nuban' | 'mobile_money' | 'basa'
  name: string
  account_number: string
  bank_code: string
  currency?: string
}): Promise<any> {
  try {
    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: data.type,
        name: data.name,
        account_number: data.account_number,
        bank_code: data.bank_code,
        currency: data.currency || PAYSTACK_CONFIG.currency
      })
    })

    const result = await response.json()
    
    if (!result.status) {
      throw new Error(result.message || 'Failed to create transfer recipient')
    }

    return result.data
  } catch (error: any) {
    console.error('Create recipient error:', error)
    throw error
  }
}

// Initiate transfer (payout to stylist)
export async function initiateTransfer(data: {
  amount: number // in kobo
  recipient: string // recipient code from createTransferRecipient
  reason?: string
  reference?: string
}): Promise<any> {
  try {
    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'balance',
        amount: data.amount * 100, // Convert to kobo
        recipient: data.recipient,
        reason: data.reason || 'Stylist payout',
        reference: data.reference
      })
    })

    const result = await response.json()
    
    if (!result.status) {
      throw new Error(result.message || 'Transfer failed')
    }

    return result.data
  } catch (error: any) {
    console.error('Transfer error:', error)
    throw error
  }
}

// Get list of Nigerian banks
export async function getBankList(): Promise<any[]> {
  try {
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      }
    })

    const result = await response.json()
    
    if (!result.status) {
      throw new Error(result.message || 'Failed to fetch banks')
    }

    return result.data
  } catch (error: any) {
    console.error('Get banks error:', error)
    throw error
  }
}

// Resolve account number (verify bank account)
export async function resolveAccountNumber(
  accountNumber: string,
  bankCode: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        }
      }
    )

    const result = await response.json()
    
    if (!result.status) {
      throw new Error(result.message || 'Failed to verify account')
    }

    return result.data
  } catch (error: any) {
    console.error('Resolve account error:', error)
    throw error
  }
}