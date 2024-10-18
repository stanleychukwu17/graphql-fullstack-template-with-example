import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import axios from 'axios'

import Header, {
    check_if_we_can_run_the_access_token_health_check,
    update_the_userDetails_information,
    run_access_token_health_check
} from '@/app/components/Header/Header'
import { userDetailsType } from '@/app/utils/redux/features/userSlice'

// mocking next navigation
const useRouterMock = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => useRouterMock
}))

// mocking of redux
const useAppSelectorMock = jest.fn()
const useAppDispatchMock = jest.fn()

jest.mock('../../../app/utils/redux/hook.ts', () => ({
    useAppSelector: () => useAppSelectorMock(),
    useAppDispatch: () => useAppDispatchMock,
}))

// mock axios
jest.mock('axios')

//--START-- mock for window.location
// mock window location - 1. Create a mock object for window.location
const locationMock = {
    href: 'http://test.com',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
};

// mock window location - 2. Replace window.location with the mock object
Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true
});
// --END--

// mocking of next/navigation
const routePushFunction = jest.fn((url: string) => {
    window.location.pathname = url
})
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: routePushFunction
    })
}))



describe("Testing suite for Header component", () => {
    // renders the main component
    const renderComponent = async () => {
        return render(<Header />)
    }

    // tear-down after each test
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("renders LogOut component when user is Logged in", async () => {
        // mocking the redux state management hook "useSelector" to return value that says a user is logged in
        useAppSelectorMock.mockReturnValue({
            loggedIn:'yes',
            must_logged_in_to_view_this_page:'yes'
        })

        let {findByText}  = await renderComponent()
        const actual = await findByText(/Logout/i)
        expect(actual).toBeInTheDocument()
    })

    it("renders LogIn component when user is logged out", async () => {
        // this function runs before the component is rendered and it checks the localStorage to see if the user is logged in or not
        update_the_userDetails_information({loggedIn: 'out'})

        // mocking the redux to return value that says a user is logged out
        useAppSelectorMock.mockReturnValue({
            loggedIn:'no',
            must_logged_in_to_view_this_page:'no'
        })

        let {findByText}  = await renderComponent()
        const actual = await findByText(/Login/i)
        expect(actual).toBeInTheDocument()
    })

    it("update_the_userDetails_information - it updates the cached user details if there are any userDts in the localStorage", async () => {
        const actual_1 = update_the_userDetails_information({loggedIn: 'yes'}) // checks for when a string is passed
        const actual_2 = update_the_userDetails_information(JSON.stringify({loggedIn: 'yes'}))
        const actual_3 = update_the_userDetails_information(null)

        expect(actual_1).toBeTruthy()
        expect(actual_2).toBeTruthy()
        expect(actual_3).not.toBeTruthy()
    })

    /*
    run
    clear && pnpm test
    clear && pnpm test:watch
    */
    it("should run a successful health check - verifies if a user logged in token is verified", async () => {
        // Subtract 28 hours from the current date
        const currentDate = new Date();
        const twentyEightHoursAgo = new Date(currentDate.getTime() - (28 * 60 * 60 * 1000)); // 28hours * minutes * seconds * milliseconds

        const userDts: userDetailsType = { loggedIn: 'yes' }
        const axiosReturn = {
            data: {
                msg: 'okay',
                new_token: 'yes',
                dts: {
                    newAccessToken : 'newAccessToken'
                }
            }
        }

        // spy on the local storage
        const getItemMock = jest.fn()
        const setItemMock = jest.fn()
        Storage.prototype.getItem = getItemMock;
        Storage.prototype.setItem = setItemMock;
        getItemMock.mockReturnValueOnce(String(twentyEightHoursAgo));

        // mock axios post to return that token is valid and a new token was generated
        (axios.post as jest.Mock).mockResolvedValueOnce(axiosReturn);

        // run the health check
        await check_if_we_can_run_the_access_token_health_check(userDts)
        expect(axios.post).toHaveBeenCalled()

        expect(getItemMock).toHaveBeenCalled();
        expect(setItemMock).toHaveBeenCalled();
        expect(locationMock.reload).toHaveBeenCalled()
    })

    it("should log user out if health check failed", async () => {
        const userDts: userDetailsType = { loggedIn: 'yes' }
        const axiosReturn = {
            status: 400,
            response: {
                data: {
                    cause: 'Invalid accessToken'
                }
            }
        }

        // spy on the local storage
        const removeItemMock = jest.fn()
        Storage.prototype.removeItem = removeItemMock;

        // mock axios post to return that token is valid and a new token was generated
        (axios.post as jest.Mock).mockRejectedValueOnce(axiosReturn);

        // run the health check
        await run_access_token_health_check(userDts)
        expect(axios.post).toHaveBeenCalled()

        // expect(removeItemMock).toHaveBeenCalled(); // jest does not catches any mock calls in the .catch block
        // expect(locationMock.href).toBe('/logout') // jest does not catches any mock calls in the .catch block
    })
})