import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { act } from 'react-dom/test-utils';

import { BACKEND_PORT as backEndPort } from '@/my.config'; // port url for making request to backEnd
import LoginPage from '@/app/(auth)/login/page' // the component we're testing

// mocking of redux
const useAppDispatchMock = jest.fn()
jest.mock('../../app/utils/redux/hook', () => ({
    useAppDispatch: () => useAppDispatchMock, // 1. COMMENT
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
        const container = render(<LoginPage />)

        const emailInput = container.getByLabelText('Username or Email') as HTMLInputElement
        const passwordInput = container.getByTestId('login password') as HTMLInputElement
        const button = container.getByRole('button', {name: /login/i}) as HTMLButtonElement

        if (fillForm === 'yes') {
            fireEvent.change(emailInput, {target: {value:userEmail}})
            fireEvent.change(passwordInput, {target: {value:userPassword}})

            // we wrap the click in an act function because, the clicking of the button will cause a state change
            await act(async () => {
                fireEvent.click(button)
            });
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

    // test-2
    it('should login a user if correct details are provided', async () => {
        // Mock the response from the server
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: { msg: 'okay' } });
        // (axios.post as jest.Mock).mockImplementation({ data: responseData });

        const { button } = await renderLoginPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor(() => {
            // assert that all the axios calls and arguments are as we expect
            expect(axios.post).toHaveBeenCalledTimes(1);

            // for below: where .mock.calls[0][0] first [0] means we're accessing the first call, if the mock was called 3times, we would have had [0] t0 [2], while the second array, i.e [0]&[1] represents the arguments that the mock was called with
            expect((axios.post as jest.Mock).mock.calls[0][0]).toBe(`${backEndPort}/users/login`);
            expect((axios.post as jest.Mock).mock.calls[0][1]).toEqual({username: userEmail, password: userPassword});
            // console.log(JSON.stringify((axios.post as jest.Mock).mock.calls[0]))

            // expect the redux dispatch function to have been called
            expect(useAppDispatchMock).toHaveBeenCalledTimes(1)

            // Assert that the user has been redirected back to the home page
            expect(routePushFunction).toHaveBeenCalled(); // i.e the next.js useRoute() function
            expect(window.location.pathname).toBe('/'); // the user has been redirected back to the home page
        });
    })

    // test-3
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

    // test-4
    it('handle errors when form is submitted, i.e if there are any errors', async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

        const { button } = await renderLoginPage({fillForm:'yes'})

        // Wait and check to see if there were any errors
        await waitFor( async () => {
            const errorMsg = await screen.findByText(/please contact the customer support and report this issue/i)
            expect(errorMsg).toBeInTheDocument()
        });
    })
})


describe("Testing Register page", () => {
    const newUser: Record<string, string> = {
        name:'stanley',
        username:'stanleyBoyIsBack',
        email:'stanleyBoy@bigman.com',
        gender:'male',
        password:'iLoveJESUS',
        password2:'iLoveJESUS'
    }

    // clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // renders the logIn page
    const renderRegisterPage = async ({fillForm} : {fillForm:'yes'|'no'}) => {
        const container = render(<LoginPage />)

        const name = container.getByLabelText('name') as HTMLInputElement
        const username = container.getByLabelText('username') as HTMLInputElement
        const email = container.getByLabelText('email') as HTMLInputElement
        const gender = container.getByLabelText('gender') as HTMLSelectElement
        const password = container.getByLabelText('password') as HTMLInputElement
        const password2 = container.getByLabelText('Re-enter Password') as HTMLInputElement
        const button = container.getByRole('button', {name: /Register/i}) as HTMLButtonElement

        if (fillForm === 'yes') {
            fireEvent.change(name, {target: {value:newUser.name}})
            fireEvent.change(username, {target: {value:newUser.username}})
            fireEvent.change(email, {target: {value:newUser.email}})
            fireEvent.change(gender, {target: {value:newUser.gender}})
            fireEvent.change(password, {target: {value:newUser.password}})
            fireEvent.change(password2, {target: {value:newUser.password2}})

            await act(async () => {
                fireEvent.click(button)
            });
        }

        return { container, name, username, email, gender, password, password2, button }
    }

    it('reject the submission if there any empty input fields & also makes sure that the component is rendered properly', async () => {
        const {container: {findAllByText}, button} = await renderRegisterPage({fillForm:'no'})

        fireEvent.click(button)
        const errorMessage = await findAllByText('This field is required!!!')

        expect(button).toBeInTheDocument() // this one ensures that the component is rendered properly
        expect(errorMessage.length).toBeGreaterThanOrEqual(1)
    })

    it('successfully registers a new user', async () => {
        // mock the axios request to return successful message from the backEnd
        (axios.post as jest.Mock).mockResolvedValueOnce({data: {msg:'okay'}})

        // render the registration page, fill the form and submit the form
        const {container, button} = await renderRegisterPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor( async () => {
            expect(axios.post).toHaveBeenCalled()
            expect(setValueMock).toHaveBeenCalled()
        })
    })

    it('handle all errors from axios (i.e when making the axios request)', async () => {
        const cause = 'Custom error from testing';
        // Mocking the Axios post method to reject with an error object
        (axios.post as jest.Mock).mockRejectedValueOnce({ message: cause, data: { msg: 'error', cause } });
    
        // render the registration page, fill the form and submit the form
        const {button} = await renderRegisterPage({fillForm:'yes'})

        const msgBox = await screen.findByTestId('message-box')
        const errMsg = within(msgBox).getByText(new RegExp(cause))

        expect(axios.post).toHaveBeenCalled()
        expect(msgBox).toBeInTheDocument()
        expect(errMsg).toBeInTheDocument()
    })
})


/**
run
clear && pnpm test
clear && pnpm test:watch
*/

/**1. COMMENT ABOUT
{
    jest.mock('../../app/redux/hook', () => ({
        useAppDispatch: () => useAppDispatchMock,
    }))

    useAppDispatch: () => useAppDispatchMock -> this was returned inside a function because in the main page.tsx component,
    the hook is executed like this:
    const dispatch = useAppDispatch()

    when the 'useAppDispatch' hook is executed, it returns the jest mock function.. so anytime the 'dispatch' is called, jest can track it

    if we did:
    jest.mock('../../app/redux/hook', () => ({
        useAppDispatch: useAppDispatchMock,
    }))

    then, there would have been a problem, because when you do:
    const dispatch = useAppDispatch()
    the jest function will be executed automatically and it will be executed with no arguments. so when next you call the 'dispatch' function,
    it will throw an error. because the mock function has already been executed during initialization

    and also, our test will fail when we do:
    expect(useAppDispatchMock).toHaveBeenCalledWith(<any_arguments>)
}
*/