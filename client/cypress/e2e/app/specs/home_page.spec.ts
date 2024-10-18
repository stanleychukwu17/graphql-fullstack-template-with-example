describe('Home Page', () => {
    it("should display the home page", () => {
        cy.visit('/')
        cy.get('[data-testid="home-page-hero"]').should('be.visible')
    })
})