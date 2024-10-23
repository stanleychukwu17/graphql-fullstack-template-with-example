'use client'
import axios from "axios"
import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/utils/redux/hook"
import { updateUser } from "@/app/utils/redux/features/userSlice"
import { urlMap } from "@/app/utils/url-mappings"

const backEndPort = process.env.NEXT_PUBLIC_BACKEND_PORT;

const config = {
    headers: {'Content-Type': 'application/json'},
};
const logOutUrl = `${backEndPort}${urlMap.serverAuth.logout}`;

export default function LogOutComp() {
    const userInfo = useAppSelector((state) => state.user)
    const dispatch = useAppDispatch()
    const route = useRouter()

    const log_this_user_out = useCallback(() => {
        axios.post(logOutUrl, userInfo, config)
        .then((res) => {
            localStorage.removeItem('userDts') // delete the localStorage cached user info
            dispatch(updateUser({loggedIn:'no', name:'', session_fid:0})) // delete the redux item

            // no need to send the user to the home page, redux will update the userInfo,
            // the useEffect below will send the user back to the home page, other you can uncomment the setTimeout
            // to manually redirect back to home page
            // setTimeout(() => { route.push('/') }, 1000) // setTimeout allows redux to finish updating before we redirect to the homePage
        })
        .catch((err) => {
            console.error('Error:', err.message, err);
            alert(err.message)
        });
    }, [dispatch, userInfo])

    // checks to make sure that the user is logged in
    useEffect(() => {
        // console.log(userInfo)
        if (userInfo.loggedIn === 'yes') {
            log_this_user_out()
        } else {
            route.push(urlMap.home) // send them man back to the home page
        }
    }, [log_this_user_out, userInfo.loggedIn, route])

    return (
        <div> </div>
    )
}