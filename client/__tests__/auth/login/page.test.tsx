import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import { BACKEND_PORT as backEndPort } from '@/my.config'; // port url for making request to backEnd
import LoginComponent from '@/app/components/auth/login/LoginComp';
import {urlMappings} from '@/app/utils/url-mappings'

// mocking of redux
const useAppDispatchMock = jest.fn()
const useAppSelector = jest.fn()
jest.mock('../../../app/utils/redux/hook', () => ({
    useAppDispatch: () => useAppDispatchMock,
    useAppSelector: () => useAppSelector,
}))

// mocking of next/navigation
const routePushFunction = jest.fn((url: string) => {
    window.location.pathname = url
})
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: routePushFunction
    })
}))

// mocking of axios
import axios from 'axios'; // importing axios because we want to mock the axios request
jest.mock('axios')

// mocking of react-hook-form
const setValueMock = jest.fn()
const { useForm } = jest.requireActual('react-hook-form'); // when you use jest.requireActual, you're telling jest to preserve all the methods that come from his package, i.e do not modify or mock any methods returned from the package/module, i.e leave everything as it is
jest.mock('react-hook-form', () => ({
    useForm: () => ({
        ...useForm(), // i'm preserving all the methods returned from the 'useForm' hook, i only want to modify setValue
        setValue: setValueMock,
    }),
}))


describe.only("Testing login component", () => {
    // define some global variables
    const userEmail = 'eazi@gmail.com'
    const userPassword = '12345'

    // clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // renders the logIn page and fills the form if 'fillForm="yes"'
    const renderLoginPage = async ({fillForm} : {fillForm:'yes'|'no'}) => {
        const container = render(<LoginComponent />)

        const emailInput = container.getByTestId('login_username') as HTMLInputElement
        const passwordInput = container.getByTestId('login_password') as HTMLInputElement
        const button = container.getByRole('button', {name: /login/i}) as HTMLButtonElement

        if (fillForm === 'yes') {
            fireEvent.change(emailInput, {target: {value:userEmail}})
            fireEvent.change(passwordInput, {target: {value:userPassword}})

            // we wrap the click in an act function because, the clicking of the button will cause a state change
            await waitFor(async () => {
                fireEvent.click(button)
            })
        }

        return {container, emailInput, passwordInput, button}
    }

    it("should render the page correctly and display the input and button elements", async () => {
        const { emailInput, passwordInput, button } = await renderLoginPage({fillForm:'no'})

        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        expect(button).toBeInTheDocument()
    })

    it('should refuse to login if empty or short details are provided', async () => {
        const {button} = await renderLoginPage({fillForm:'no'})

        // submit the form
        fireEvent.click(button)

        // get the error messages and confirm that they are visible
        const errMsg = await screen.findAllByText(/This field is required/i)

        // assertion
        expect(errMsg.length).toBeGreaterThanOrEqual(1) // at-least 1 error message should be visible
        expect(errMsg[0]).toBeInTheDocument()
    })

    it('should login a user if correct details are provided', async () => {
        const login_url = `${backEndPort}${urlMappings.serverAuth.login}`;

        // Mock the response from the server
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: { msg: 'okay' } });
        // (axios.post as jest.Mock).mockImplementation({ data: responseData });

        const { button } = await renderLoginPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor(() => {
            // assert that all the axios calls and arguments are as we expect
            expect(axios.post).toHaveBeenCalledTimes(1);

            // for below: where .mock.calls[0][0] first [0] means we're accessing the first call, if the mock was called 3times, we would have had [0] to [2]
            // while the second array, i.e [0]&[1] represents the arguments that the mock was called with
            expect((axios.post as jest.Mock).mock.calls[0][0]).toBe(login_url);
            expect((axios.post as jest.Mock).mock.calls[0][1]).toEqual({username: userEmail, password: userPassword});
            // console.log(JSON.stringify((axios.post as jest.Mock).mock.calls[0]))

            // expect the redux dispatch function to have been called
            expect(useAppDispatchMock).toHaveBeenCalledTimes(2)

            // Assert that the user has been redirected back to the home page
            expect(routePushFunction).toHaveBeenCalled(); // i.e the next.js useRoute() function
            expect(window.location.pathname).toBe('/'); // the user has been redirected back to the home page
        });
    })

    it('should show an error message if there is an issue from the server', async () => {
        // Mock the response from the server
        const responseData = { msg: 'bad', 'cause':'you provided an invalid username or password' };
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: responseData });

        const { button } = await renderLoginPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor( async () => {
            const errorMsg = await screen.findByText(/you provided an invalid username or password/i)
            expect(errorMsg).toBeInTheDocument()
        });
    })

    it('handle errors when form is submitted, i.e if there are any errors', async () => {
        // (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Server error'));
        const cause = "server error"
        const axiosError = {status: 400, response: { data: {cause} }};
        (axios.post as jest.Mock).mockRejectedValueOnce(axiosError);

        const { button } = await renderLoginPage({fillForm:'yes'})

        // Wait and check to see if there were any errors
        await waitFor( async () => {
            const errorMsg = await screen.findByText(new RegExp(cause, 'i'))
            expect(errorMsg).toBeInTheDocument()
        });
    })
})