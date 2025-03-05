import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import VendorTransaction from './vendorTransaction'
import AuthContext from '../context/authContext'
import * as API from '../utils/axiosInstance'

// Comprehensive mock for axiosInstance
vi.mock('../utils/axiosInstance', () => ({
  utils: {
    get: vi.fn()
  },
  default: vi.fn()
}))

// Mock other dependencies
vi.mock('../dashboard/header/header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}))

vi.mock('../dashboard/sideBar/vendorSidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>
}))

// Sample mock transactions data
const mockTransactions = [
  {
    transactionId: 'TX001',
    transactionAmount: 100.50,
    status: 'Completed',
    senderAccNo: '1234567890',
    receiverAccNo: '0987654321',
    debitCardNumber: '4111111111111111',
    transactionDate: '2023-05-15T10:30:00Z'
  }
]

describe('VendorTransaction Component', () => {
  const mockToken = 'fake-auth-token'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  

  it('handles empty transactions', () => {
    // Mock the API call with empty array
    vi.mocked(API.utils.get).mockReturnValue(
      Promise.resolve({ data: [] })
    )

    const { container } = render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <VendorTransaction />
      </AuthContext.Provider>
    )

    // Ensure no transaction rows are rendered except header row
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(0)
  })

  

  it('does not fetch transactions without token', () => {
    // Mock the API call
    const apiGetSpy = vi.spyOn(API.utils, 'get')

    render(
      <AuthContext.Provider value={{ token: null }}>
        <VendorTransaction />
      </AuthContext.Provider>
    )

    // Ensure API call was not made
    expect(apiGetSpy).not.toHaveBeenCalled()
  })
})



