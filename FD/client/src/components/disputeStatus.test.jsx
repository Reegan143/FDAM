import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import DisputeStatus from './disputeStatus'
import AuthContext from './context/authContext'
import API from './utils/axiosInstance'

// Mock dependencies
vi.mock('./utils/axiosInstance', () => ({
  default: {
    utils: {
      post: vi.fn()
    }
  },
  setAuthToken: vi.fn()
}))

vi.mock('./dashboard/header/header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}))

vi.mock('./dashboard/sideBar/sidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>
}))


describe('DisputeStatus Component', () => {
  const mockToken = 'test-token'
  const mockDispute = {
    ticketNumber: 'TICKET123',
    transactionId: 'TRANS456',
    amount: 100.50,
    createdAt: '2024-03-04T10:00:00Z',
    complaintType: 'Billing',
    status: 'Pending',
    description: 'Test dispute description'
  }

  const renderComponent = (token = mockToken) => {
    return render(
      <AuthContext.Provider value={{ token }}>
        <DisputeStatus />
      </AuthContext.Provider>
    )
  }

  it('renders initial component correctly', () => {
    const { getByPlaceholderText, getByText } = renderComponent()
    
    expect(getByPlaceholderText('Enter Ticket Number')).toBeTruthy()
    expect(getByText('Search')).toBeTruthy()
    expect(document.querySelector('[data-testid="mock-header"]')).toBeTruthy()
    expect(document.querySelector('[data-testid="mock-sidebar"]')).toBeTruthy()
  })

  it('handles ticket number input correctly', () => {
    const { getByPlaceholderText } = renderComponent()
    const input = getByPlaceholderText('Enter Ticket Number')
    
    fireEvent.change(input, { target: { value: 'TICKET123' } })
    expect(input.value).toBe('TICKET123')
  })

  it('shows loading state during search', () => {
    vi.spyOn(API.utils, 'post').mockImplementation(() => new Promise(() => {}))
    
    const { getByText, getByPlaceholderText } = renderComponent()
    const input = getByPlaceholderText('Enter Ticket Number')
    const searchButton = getByText('Search')
    
    fireEvent.change(input, { target: { value: 'TICKET123' } })
    fireEvent.click(searchButton)
    
    expect(getByText('Searching...')).toBeTruthy()
  })


  it('handles search error', async () => {
    vi.spyOn(API.utils, 'post').mockRejectedValue({
      response: { data: { error: 'Dispute not found' } }
    })
    
    const { getByPlaceholderText, getByText, findByText } = renderComponent()
    const input = getByPlaceholderText('Enter Ticket Number')
    const searchButton = getByText('Search')
    
    fireEvent.change(input, { target: { value: 'INVALIDTICKET' } })
    fireEvent.click(searchButton)
    
    expect(await findByText('Dispute not found')).toBeTruthy()
  })

  it('handles no results state', async () => {
    vi.spyOn(API.utils, 'post').mockResolvedValue({ data: null })
    
    const { getByPlaceholderText, getByText, findByText } = renderComponent()
    const input = getByPlaceholderText('Enter Ticket Number')
    const searchButton = getByText('Search')
    
    fireEvent.change(input, { target: { value: 'NONEXISTENT' } })
    fireEvent.click(searchButton)
    
    expect(await findByText('No dispute found with this ticket number.')).toBeTruthy()
  })

 
})