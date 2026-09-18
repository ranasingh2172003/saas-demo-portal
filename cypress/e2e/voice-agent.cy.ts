describe('Voice Agent Dashboard', () => {
  it('should load the voice agent page', () => {
    cy.visit('/voice')
    cy.get('h1').should('contain', 'Voice Receptionist')
  })
})
