import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
// import { describe } from 'node:test'
import Page from '@/app/page'


const useAppSelectorMock = jest.fn()
const useAppDispatchMock = jest.fn()

jest.mock('../app/redux/hook', () => ({
    useAppSelector: () => useAppSelectorMock(),
    useAppDispatch: () => useAppDispatchMock,
}))

describe("Page test", () => {

    const render_default_page = () => {
        // Mock useSelector to return the user object of the user not logged in
        useAppSelectorMock.mockReturnValue({ loggedIn: 'no' });

        // renders the HomePage component
       return render(<Page />);
    }

    it("renders the HomePage component properly", () => {
        const { getByText, getByRole } = render_default_page()

        // assert that the page loads correctly and the button is visible
        expect(getByText('Hello world')).toBeInTheDocument();
        expect(getByRole('button', {name: /update must be logged in to yes/})).toBeInTheDocument();
    })

    it('should update the status of the page to must be logged_in when the button is clicked', () => {
        // useAppDispatchMock.mockReturnValue(jest.fn)
        // i would have done the above if i did:: useAppDispatch: () => useAppDispatchMock(), but i did:: useAppDispatch: () => useAppDispatchMock
        const { getByRole } = render_default_page()

        const button = getByRole('button', {name: /update must be logged in to yes/})
        fireEvent.click(button)

        expect(useAppDispatchMock).toHaveBeenCalled()
        expect(useAppDispatchMock).toHaveBeenCalledWith({"payload": {"must_logged_in_to_view_this_page": "yes"}, "type": "user/updateUser"})
    })
})