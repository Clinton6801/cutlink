// Save as: src/app/stylist/bank-account/actions.ts
'use server'

import { resolveAccountNumber, createTransferRecipient, getBankList } from '../../../lib/paystack'

// Wrapper for fetching banks
export async function fetchBanksAction() {
  return await getBankList()
}

// Wrapper for resolving account number
export async function verifyAccountAction(accountNumber: string, bankCode: string) {
  try {
    const result = await resolveAccountNumber(accountNumber, bankCode)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Wrapper for creating recipient
export async function createRecipientAction(data: { name: string; account_number: string; bank_code: string }) {
  try {
    const result = await createTransferRecipient({
        type: 'nuban',
        ...data
    })
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}