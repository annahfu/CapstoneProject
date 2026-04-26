import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchScreen from '../../src/components/SearchScreen'

// Mock constants
jest.mock('../../src/constants', () => ({
  CITIES: ['Any', 'New York', 'Brooklyn'],
  NEIGHBORHOODS_BY_CITY: {
    Any: ['Any'],
    'New York': ['Any', 'Midtown', 'Greenwich Village'],
    Brooklyn: ['Any', 'Williamsburg', 'DUMBO'],
  },
  VIBES: ['Any', 'Chill', 'Lively', 'Romantic'],
  PRICE_TIERS: ['Any', '$', '$$', '$$$'],
  ACTIVITY_TYPES: ['Any', 'Dining', 'Nightlife', 'Culture'],
}))

// Mock the custom hook
jest.mock('../../src/hooks', () => ({
  useLocalTime: () => '7:30 PM',
}))

const mockOnViewDetail = jest.fn()

// Helper to mock a successful API response
function mockFetchSuccess(recommendations = []) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ success: true, recommendations }),
    })
  )
}

// Helper to mock a failed API response
function mockFetchFailure() {
  global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
}

describe('SearchScreen', () => {
  beforeEach(() => {
    mockOnViewDetail.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // --- Unit-level tests for the SearchScreen UI ---

  test('renders the Find places heading', () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    expect(screen.getByText('Find places')).toBeInTheDocument()
  })

  test('renders all filter dropdowns', () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(screen.getByText('Neighborhood')).toBeInTheDocument()
    expect(screen.getByText('Atmosphere')).toBeInTheDocument()
    expect(screen.getByText('Max Price')).toBeInTheDocument()
    expect(screen.getByText('Activity Type')).toBeInTheDocument()
  })

  test('renders the search button', () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    expect(screen.getByText('🔍 Get Recommendations')).toBeInTheDocument()
  })

  test('renders the drinks checkbox', () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    expect(screen.getByText('Must serve alcohol')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  // --- Interaction tests ---

  test('changing city resets neighborhood to Any', async () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    const citySelect = screen.getAllByRole('combobox')[0]
    await userEvent.selectOptions(citySelect, 'New York')
    const neighborhoodSelect = screen.getAllByRole('combobox')[1]
    expect(neighborhoodSelect.value).toBe('Any')
  })

  test('neighborhoods update when city changes', async () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    const citySelect = screen.getAllByRole('combobox')[0]
    await userEvent.selectOptions(citySelect, 'Brooklyn')
    expect(screen.getByText('Williamsburg')).toBeInTheDocument()
    expect(screen.getByText('DUMBO')).toBeInTheDocument()
  })

  test('typing in Activities input updates value', async () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    const input = screen.getByPlaceholderText('e.g. Eating, Museums, Dancing')
    await userEvent.type(input, 'Jazz')
    expect(input.value).toBe('Jazz')
  })

  test('toggling drinks checkbox works', async () => {
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  // --- Integration tests: API call & results ---

  test('shows loading state while searching', async () => {
    mockFetchSuccess([])
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    fireEvent.click(screen.getByText('🔍 Get Recommendations'))
    expect(screen.getByText('Searching…')).toBeInTheDocument()
  })

  test('shows empty state when no results returned', async () => {
    mockFetchSuccess([])
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    fireEvent.click(screen.getByText('🔍 Get Recommendations'))
    await waitFor(() =>
      expect(screen.getByText('No places found. Try relaxing some filters.')).toBeInTheDocument()
    )
  })

  test('renders PlaceCards when results are returned', async () => {
    const fakeResults = [
      { Name_of_place: 'Blue Note', Type: 'Jazz Bar', Neighborhood: 'Greenwich Village', similarity_score: 0.9 },
      { Name_of_place: 'The Rusty Nail', Type: 'Bar', Neighborhood: 'Williamsburg', similarity_score: 0.75 },
    ]
    mockFetchSuccess(fakeResults)
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    fireEvent.click(screen.getByText('🔍 Get Recommendations'))
    await waitFor(() => expect(screen.getByText('Blue Note')).toBeInTheDocument())
    expect(screen.getByText('The Rusty Nail')).toBeInTheDocument()
    expect(screen.getByText('Results (2)')).toBeInTheDocument()
  })

  test('calls onViewDetail when a PlaceCard is clicked', async () => {
    const fakeResults = [
      { Name_of_place: 'Blue Note', Type: 'Jazz Bar', Neighborhood: 'Greenwich Village', similarity_score: 0.9 },
    ]
    mockFetchSuccess(fakeResults)
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    fireEvent.click(screen.getByText('🔍 Get Recommendations'))
    await waitFor(() => expect(screen.getByText('Blue Note')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Blue Note').closest('.place-card'))
    expect(mockOnViewDetail).toHaveBeenCalledWith(fakeResults[0])
  })

  test('handles API failure gracefully without crashing', async () => {
    mockFetchFailure()
    render(<SearchScreen onViewDetail={mockOnViewDetail} />)
    fireEvent.click(screen.getByText('🔍 Get Recommendations'))
    await waitFor(() =>
      expect(screen.getByText('No places found. Try relaxing some filters.')).toBeInTheDocument()
    )
  })
})
