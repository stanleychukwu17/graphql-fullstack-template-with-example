import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeMenu from '@/app/components/Header/theme/ThemesMenu'

const closeMenuMock = jest.fn() as React.Dispatch<React.SetStateAction<boolean>>

describe("Testing the Theme Menu", () => {
    const renderThemeMenu = async () => {
        return render(<ThemeMenu closeMenu={closeMenuMock} />)
    }

    it("it should render the component properly", async () => {
        await renderThemeMenu ()

        const themeMenu = screen.getByTestId('theme-menu')
        expect(themeMenu).toBeInTheDocument()
    })

    it("it should select a theme when the theme is clicked on", async () => {
        await renderThemeMenu ()
        const menuBtn = screen.getByTestId('theme-default')
        fireEvent.click(menuBtn)
    })

    it("it should close the menu when the close button is clicked", async () => {
        await renderThemeMenu ()
        const closeBtn = screen.getByTestId('close-theme-menu')

        fireEvent.click(closeBtn)
        expect(closeMenuMock).toHaveBeenCalled()
        expect(closeMenuMock).toHaveBeenCalledWith(false)
    })

    it("it should close menu on escape key press", async () => {
        await renderThemeMenu ()
        const menuBtn = screen.getByTestId('theme-default')

        fireEvent.keyDown(menuBtn, {key: 'Escape', code: 'Escape', charCode: 27})

        expect(closeMenuMock).toHaveBeenCalled()
        expect(closeMenuMock).toHaveBeenCalledWith(false)
    })
})