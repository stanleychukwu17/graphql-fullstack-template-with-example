'use client'
import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "../../redux/hook";
import { updateUser, userDetailsType } from "../../redux/features/userSlice";
import { BACKEND_PORT as backEndPort } from "@/my.config";
import Link from "next/link";

import { CiLight } from "react-icons/ci";

// import other components to use in this page
import LoggedInCard from "./LoggedInCard";
import LoggedOutCard from "./LoggedOutCard";
import ThemesMenu, {update_this_user_preferred_theme} from './theme/ThemesMenu'

// import the stylesheet
import './Header.scss'

//--START-- checks to see if there are any stored information about the user in the user's localStorage space
let userDts: userDetailsType = {loggedIn: 'no'}
try {
    const cached_user_dts  = window.localStorage.getItem('userDts') // the user details stored to the localStorage whenever a user logs in

    if (cached_user_dts) {
        // const cached_user_parsed = JSON.parse(cached_user_dts) as unknown as userDetailsType
        const cached_user_parsed = JSON.parse(cached_user_dts)
    
        userDts.loggedIn = 'yes'
        userDts = {...userDts, ...cached_user_parsed}
    }
} catch (err) {}
//--END--

//--START-- validates the accessToken and Refresh token every 24_hour
function run_access_token_health_check () {
    axios.post(`${backEndPort}/healthCheck/accessToken`, userDts, {headers: {'Content-Type': 'application/json'}})
    .then(re => {
        // update the lastTime checked to be the current time
        localStorage.setItem('last_24hr_check', `${new Date()}`)

        // if true, then it means the accessToken has expired and the refreshToken has also expired
        if (re.data.msg === 'bad' && re.data.action === 'logout') {
            localStorage.removeItem('userDts')
            location.href = '/logout'
            return true;
        }

        // the below means the accessToken has expired and so a new accessToken was generated
        if (re.data.msg === 'okay' && re.data.new_token === 'yes') {
            localStorage.setItem('userDts', JSON.stringify({...userDts, accessToken:re.data.dts.newAccessToken}));
            location.reload()
        }
    })
    .catch(err => {
        console.log(err)
    })
}

try {
    const last_24hr_check = localStorage.getItem('last_24hr_check')
    if (last_24hr_check) {
        const storedDate = new Date(last_24hr_check).getTime() // .getTime() returns the number of milliseconds
        const currentDate = new Date().getTime() // .getTime() returns the number of milliseconds
        const hourDiff = (currentDate - storedDate) / (1000 * 60 * 60); // converts the difference to hours.. since i want to know if the last check has been older than an 24hours
    
        if (hourDiff >= 24 && userDts.loggedIn === 'yes') {
            run_access_token_health_check()
        }
    } else {
        const current_time = new Date()
        localStorage.setItem('last_24hr_check', `${current_time}`)
    }
} catch (err) {}
//--END--

//--START-- for color theme
function check_if_there_is_a_user_selected_theme () {
    if (typeof window !== 'undefined') {
        const myCustomTheme = window.localStorage.getItem("myCustomTheme")

        myCustomTheme && update_this_user_preferred_theme(myCustomTheme)
    }
}
//--END--

export default function Header() {
    const userInfo = useAppSelector(state => state.user)
    const reduxDispatch = useAppDispatch()
    const route = useRouter()
    const [openThemeMenu, setOpenThemeMenu] = useState<boolean>(false)

    useLayoutEffect(() => {
        if (userDts.loggedIn === 'yes' && userInfo.loggedIn === 'no') {
            reduxDispatch(updateUser(userDts))
        }

        if (userInfo.must_logged_in_to_view_this_page === 'yes') {
            route.push('/login')
        }
    }, [route, reduxDispatch, userInfo.must_logged_in_to_view_this_page, userInfo.loggedIn])

    // for color theme
    useLayoutEffect(() => {
        check_if_there_is_a_user_selected_theme()
    }, [])

    return (
        <header className="headerCvr py-5 px-10">
            <div className="flex justify-between items-center pb-5">
                <div className="text-2xl font-bold">
                    <Link href="/">NEXT.</Link>
                </div>
                <div className="flex space-x-10 items-center">
                    {userInfo.loggedIn === 'no' && <LoggedOutCard />}
                    {userInfo.loggedIn === 'yes' && <LoggedInCard />}

                    <div className="changeThemeCover flex space-x-2" onClick={() => { setOpenThemeMenu(true) }}>
                        <p><CiLight /></p>
                        <p>Theme</p>
                    </div>
                </div>
            </div>
            <div className="">
                <button className="bg-yellow-200 mx-2" onClick={() => { update_this_user_preferred_theme('light') }}> light theme </button>
                <button className="bg-yellow-200 mx-2" onClick={() => { update_this_user_preferred_theme('dark') }}> dark theme </button>
                <button className="bg-yellow-200 mx-2" onClick={() => { update_this_user_preferred_theme('cupcake') }}> cupcake theme </button>
            </div>
            {openThemeMenu && <ThemesMenu closeMenu={setOpenThemeMenu} />}
        </header>
    )
}