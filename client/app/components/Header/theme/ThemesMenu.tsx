'use client'
import { useCallback, useEffect } from "react";
import { IoClose } from "react-icons/io5";

// importing variables to use here
import differentThemeTitles from "./themes";

// import the stylesheet
import './ThemesMenu.scss'

//--START-- for color theme
export function update_this_user_preferred_theme (theme: string) {
    // Access the root HTML element
    var htmlElement = document.documentElement;

    // Add an attribute to the HTML element
    htmlElement.setAttribute("data-theme", theme);

    // update the item in the user localStorage
    localStorage.setItem("myCustomTheme", theme)
}
//--END--

type themesMenuProps = {
    closeMenu: React.Dispatch<React.SetStateAction<boolean>>
}
export default function ThemesMenu({closeMenu}: themesMenuProps) {

    // Check if the pressed key is Escape (key code 27)
    const checkIfToCloseMenu = useCallback((event: KeyboardEvent) => {
        // console.log(event.key)
        if (event.key === "Escape" || event.key === "Esc") {
            closeMenu(false);
        }
    }, [closeMenu])

    // adds a "keypress" event to window, so we can use the "Esc" key to close the theme options menu
    useEffect(() => {
        window.addEventListener("keydown", checkIfToCloseMenu)

        return () => {
            window.removeEventListener("keydown", checkIfToCloseMenu)
        }
    }, [checkIfToCloseMenu])

    return (
        <div className="ThemeAbsoluteCvr z-10" data-testid="theme-menu">
            <div className="ThemeCloser" data-testid="close-theme-menu" onClick={() => closeMenu(false)}>
                <p><IoClose /></p>
            </div>
            {Object.keys(differentThemeTitles).map((item) => (
                <div
                    style={{
                        backgroundColor: `var(--bg-100-${item})`,
                        color: `var(--text-100-${item})`
                    }}
                    key={`theme-${item}`}
                    data-testid={`theme-${item}`}
                    className="ThemeChildMain"
                    onClick={() => update_this_user_preferred_theme(item) }
                >
                    <div style={{backgroundColor: `var(--bg-200-${item})`}}></div>
                    <div style={{backgroundColor: `var(--bg-300-${item})`}}></div>
                    <div className="">
                        <div className="themeTitle">{item}</div>
                        <div className="themeBtn">
                            {[1,2,3,4].map(num => (
                                <p
                                    key={`themeBtnNum-${num}`}
                                    style={{backgroundColor: `var(--button${num}-bg-${item})`, color: `var(--button${num}-text-${item})`}}
                                    >
                                    {num}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}