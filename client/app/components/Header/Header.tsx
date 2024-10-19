'use client'

import 'dotenv/config'

import './Header.scss' // import the stylesheet
import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { CiLight } from "react-icons/ci";

import { useAppSelector, useAppDispatch } from "@/app/utils/redux/hook";
import { updateUser, userDetailsType } from "@/app/utils/redux/features/userSlice";
import { urlMap } from "@/app/utils/url-mappings";

const backEndPort = process.env.BACKEND_PORT;

// import other components to use in this page
import LoggedInCard from "./LoggedInCard";
import LoggedOutCard from "./LoggedOutCard";
import ThemesMenu, {update_this_user_preferred_theme} from './theme/ThemesMenu'


//--START-- checks to see if there are any stored information about the user in the user's localStorage space
let userDts: userDetailsType = {loggedIn: 'no'}
export function update_the_userDetails_information (cached_user_details: string|null|object) {
    if (cached_user_details) {
        let user_dtsParsed;

        if (typeof cached_user_details === 'string') {
            user_dtsParsed = JSON.parse(cached_user_details as string)
        } else if (typeof cached_user_details === 'object') {
            user_dtsParsed = cached_user_details
        }
    
        userDts.loggedIn = 'yes'
        userDts = {...userDts, ...user_dtsParsed}
        return true
    } else {
        return false
    }
}

try {
    const cached_user_dts = window.localStorage.getItem('userDts') // the user details stored to the localStorage whenever a user logs in
    update_the_userDetails_information(cached_user_dts);
} catch (err: Error|unknown) {
    // console.log(err.message) = window is not defined
    // console.log(err, (err as Error).message)
}
//--END--

//--START--
//validates the accessToken and Refresh token every 24_hour
export function check_if_we_can_run_the_access_token_health_check (uDts: userDetailsType) {
    try {
        const last_24hr_check = window.localStorage.getItem('last_24hr_check')

        if (last_24hr_check) {
            const storedDate = new Date(last_24hr_check).getTime() // .getTime() returns the number of milliseconds
            const currentDate = new Date().getTime() // .getTime() returns the number of milliseconds
            const hourDiff = (currentDate - storedDate) / (1000 * 60 * 60); // converts the difference to hours.. since i want to know if the last check is now over 24hours
        
            if (hourDiff >= 24 && uDts.loggedIn === 'yes') {
                run_access_token_health_check(uDts)
            }
        } else {
            const current_time = new Date()
            localStorage.setItem('last_24hr_check', `${current_time}`)
        }

        // if (typeof alert != 'undefined') { alert(err.message) }
    } catch(err: Error|unknown) {
        // console.log(err, (err as Error).message)
    }
}

export async function run_access_token_health_check (uDts: userDetailsType) {
    axios.post(`${backEndPort}/healthCheck/accessToken`, uDts, {headers: {'Content-Type': 'application/json'}})
    .then(re => {
        // if !window.localStorage, then it means that next.js is not compiling in server mode
        if (window.localStorage) {
            // update the lastTime checked to be the current time
            window.localStorage.setItem('last_24hr_check', `${new Date()}`)

            // the below means the accessToken has expired and so a new accessToken was generated
            if (re.data.msg === 'okay' && re.data.new_token === 'yes') {
                localStorage.setItem('userDts', JSON.stringify({...uDts, accessToken:re.data.dts.newAccessToken}));
                location.reload()
            }
        }
    }).catch(err => {
        // console.log(err, err.code, err.message)
        // if (err.code === "ERR_NETWORK") { console.log("The server is not running") }

        if (err.response?.data.cause === 'Invalid accessToken') {
            localStorage.removeItem('userDts')
            location.href = urlMap.clientAuth.logout
        }
    })
}

check_if_we_can_run_the_access_token_health_check(userDts)
//--END--

//--START-- for color theme
function check_if_there_is_a_user_selected_theme () {
    if (typeof window !== 'undefined') {
        const myCustomTheme = window.localStorage.getItem("myCustomTheme")

        if (myCustomTheme) update_this_user_preferred_theme(myCustomTheme);
    }
}
//--END--

export default function Header() {
    const userInfo = useAppSelector(state => state.user)
    const reduxDispatch = useAppDispatch()
    const route = useRouter()
    const [openThemeMenu, setOpenThemeMenu] = useState<boolean>(false)
    const animationControl = useAnimationControls()

    useEffect(() => {
        // updates the redux store to have the current details of the user
        if (userDts.loggedIn === 'yes' && userInfo.loggedIn === 'no') {
            reduxDispatch(updateUser(userDts))
        }

        if (userInfo.must_logged_in_to_view_this_page === 'yes') {
            route.push(urlMap.clientAuth.login)
        }
        animationControl.start({
            opacity: 1,
        })
    }, [route, reduxDispatch, userInfo.must_logged_in_to_view_this_page, userInfo.loggedIn, animationControl])

    // for color theme
    useLayoutEffect(() => {
        check_if_there_is_a_user_selected_theme()
    }, [])

    return (
        <header className="headerCvr relative py-5 px-10" data-testid="site header">
            <div className="flex justify-between items-center pb-5 h-[55px]">
                <div className="text-2xl font-bold">
                    <Link href="/">NEXT.</Link>
                </div>
                <motion.div initial={{opacity: 0}} animate={animationControl} className="flex space-x-10 items-center">
                    {userInfo.loggedIn === 'no' && <LoggedOutCard />}
                    {userInfo.loggedIn === 'yes' && <LoggedInCard />}

                    <div className="changeThemeCover flex space-x-2" onClick={() => { setOpenThemeMenu(true) }}>
                        <p><CiLight /></p>
                        <p>Theme</p>
                    </div>
                </motion.div>
            </div>
            {openThemeMenu && <ThemesMenu closeMenu={setOpenThemeMenu} />}
        </header>
    )
}