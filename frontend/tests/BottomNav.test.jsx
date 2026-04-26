import { render, screen, fireEvent } from '@testing-library/react'
import BottomNav from '../../src/components/BottomNav'

// Mock the constants module
jest.mock('../../src/constants', () => ({
  NAV_ITEMS: [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'saved', icon: '❤️', label: 'Saved' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]
}))

describe('BottomNav', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  test('renders all nav items', () => {
    render(<BottomNav active="home" onChange={mockOnChange} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  test('applies active class to the active nav item', () => {
    render(<BottomNav active="search" onChange={mockOnChange} />)
    const searchBtn = screen.getByText('Search').closest('button')
    expect(searchBtn).toHaveClass('nav-active')
  })

  test('does not apply active class to inactive nav items', () => {
    render(<BottomNav active="search" onChange={mockOnChange} />)
    const homeBtn = screen.getByText('Home').closest('button')
    expect(homeBtn).not.toHaveClass('nav-active')
  })

  test('calls onChange with correct id when a nav item is clicked', () => {
    render(<BottomNav active="home" onChange={mockOnChange} />)
    fireEvent.click(screen.getByText('Search').closest('button'))
    expect(mockOnChange).toHaveBeenCalledWith('search')
  })

  test('calls onChange when switching between tabs', () => {
    render(<BottomNav active="home" onChange={mockOnChange} />)
    fireEvent.click(screen.getByText('Saved').closest('button'))
    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith('saved')
  })
})
