// Cypress End-to-End Tests
// Run with: npm run cypress:open (make sure your app is running on localhost:3000)

describe('Full User Journey', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  // --- Navigation ---

  it('loads the home screen on first visit', () => {
    cy.contains('Find places').should('not.exist') // Search screen not shown by default
    cy.get('.bottom-nav').should('be.visible')
  })

  it('navigates to Search screen via bottom nav', () => {
    cy.get('.nav-item').contains('Search').click()
    cy.contains('Find places').should('be.visible')
  })

  it('navigates to Saved screen via bottom nav', () => {
    cy.get('.nav-item').contains('Saved').click()
    cy.get('.screen-body').should('be.visible')
  })

  it('navigates to Profile screen via bottom nav', () => {
    cy.get('.nav-item').contains('Profile').click()
    cy.get('.screen-body').should('be.visible')
  })

  // --- Search Flow ---

  it('user can search and see results', () => {
    cy.intercept('POST', '/api/recommendations', {
      statusCode: 200,
      body: {
        success: true,
        recommendations: [
          {
            Name_of_place: 'Blue Note Jazz Club',
            Type: 'Jazz Bar',
            Neighborhood: 'Greenwich Village',
            similarity_score: 0.87,
            price_tier: '$$$',
          }
        ]
      }
    }).as('getRecommendations')

    cy.get('.nav-item').contains('Search').click()
    cy.get('button').contains('🔍 Get Recommendations').click()
    cy.wait('@getRecommendations')
    cy.contains('Blue Note Jazz Club').should('be.visible')
    cy.contains('87% match').should('be.visible')
  })

  it('shows empty state when no results found', () => {
    cy.intercept('POST', '/api/recommendations', {
      statusCode: 200,
      body: { success: true, recommendations: [] }
    }).as('emptySearch')

    cy.get('.nav-item').contains('Search').click()
    cy.get('button').contains('🔍 Get Recommendations').click()
    cy.wait('@emptySearch')
    cy.contains('No places found. Try relaxing some filters.').should('be.visible')
  })

  it('user can filter by city and see updated neighborhoods', () => {
    cy.get('.nav-item').contains('Search').click()
    cy.get('select').first().select('Brooklyn')
    cy.get('select').eq(1).find('option').should('contain', 'Williamsburg')
  })

  it('shows loading state while fetching results', () => {
    cy.intercept('POST', '/api/recommendations', (req) => {
      req.reply((res) => {
        res.delay = 500
        res.send({ success: true, recommendations: [] })
      })
    })

    cy.get('.nav-item').contains('Search').click()
    cy.get('button').contains('🔍 Get Recommendations').click()
    cy.contains('Searching…').should('be.visible')
  })

  // --- Place Detail Flow ---

  it('clicking a place card opens the detail screen', () => {
    cy.intercept('POST', '/api/recommendations', {
      statusCode: 200,
      body: {
        success: true,
        recommendations: [
          { Name_of_place: 'Blue Note Jazz Club', Type: 'Jazz Bar', Neighborhood: 'Greenwich Village', similarity_score: 0.87 }
        ]
      }
    })

    cy.get('.nav-item').contains('Search').click()
    cy.get('button').contains('🔍 Get Recommendations').click()
    cy.contains('Blue Note Jazz Club').click()
    // Detail screen should now show
    cy.get('.screen-body').should('be.visible')
  })
})
