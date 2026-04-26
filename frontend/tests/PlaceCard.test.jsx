import { render, screen, fireEvent } from '@testing-library/react'
import PlaceCard from '../../src/components/PlaceCard'

const mockPlace = {
  Name_of_place: 'Blue Note Jazz Club',
  Type: 'Jazz Bar',
  Neighborhood: 'Greenwich Village',
  Vibe_Type: 'Chill & Intimate',
  similarity_score: 0.87,
  Category: 'Music',
  price_tier: '$$$',
}

describe('PlaceCard', () => {
  const mockOnClick = jest.fn()
  const mockOnUnsave = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
    mockOnUnsave.mockClear()
  })

  test('renders place name', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    expect(screen.getByText('Blue Note Jazz Club')).toBeInTheDocument()
  })

  test('renders place type badge', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    expect(screen.getByText('Jazz Bar')).toBeInTheDocument()
  })

  test('renders neighborhood', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    expect(screen.getByText('Greenwich Village')).toBeInTheDocument()
  })

  test('renders vibe type', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    expect(screen.getByText('Chill & Intimate')).toBeInTheDocument()
  })

  test('renders similarity score as percentage', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    expect(screen.getByText('87% match')).toBeInTheDocument()
  })

  test('does not render match badge when similarity_score is null', () => {
    const placeNoScore = { ...mockPlace, similarity_score: null }
    render(<PlaceCard place={placeNoScore} onClick={mockOnClick} />)
    expect(screen.queryByText(/match/)).not.toBeInTheDocument()
  })

  test('calls onClick when card is clicked', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    fireEvent.click(screen.getByText('Blue Note Jazz Club').closest('.place-card'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('renders unsave button when showUnsave is true', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} onUnsave={mockOnUnsave} showUnsave={true} />)
    expect(screen.getByText('❤️')).toBeInTheDocument()
  })

  test('does not render unsave button when showUnsave is false', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} showUnsave={false} />)
    expect(screen.queryByText('❤️')).not.toBeInTheDocument()
  })

  test('calls onUnsave without triggering onClick when heart button clicked', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} onUnsave={mockOnUnsave} showUnsave={true} />)
    fireEvent.click(screen.getByText('❤️'))
    expect(mockOnUnsave).toHaveBeenCalledTimes(1)
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  test('renders price tier tag', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />)
    expect(screen.getByText('$$$')).toBeInTheDocument()
  })

  // fallback prop names (place.name instead of place.Name_of_place)
  test('falls back to place.name if Name_of_place is missing', () => {
    const altPlace = { name: 'Corner Cafe', type: 'Cafe', neighborhood: 'SoHo' }
    render(<PlaceCard place={altPlace} onClick={mockOnClick} />)
    expect(screen.getByText('Corner Cafe')).toBeInTheDocument()
  })
})
