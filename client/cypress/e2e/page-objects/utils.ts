export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

type interceptProps = {
    requestName: string;
    force_mock?: boolean;
    method: "POST" | "GET";
    url: string;
    statusCode: number;
    body: object;
}
export function interceptRequest ({force_mock = false, requestName, method, url, statusCode, body}: interceptProps) {
    const cypress_test_with = Cypress.env('CYPRESS_TEST_WITH');
    let mocked = false

    if (cypress_test_with === "MOCK_DATABASE" || force_mock === true) {
        // Intercept the registration request and provide a custom response
        mocked = true
        cy.intercept(method, url, {statusCode, body}).as(requestName);
    } else if (cypress_test_with === "REAL_DATABASE") {
        // do nothing
    }

    return {mocked}
}