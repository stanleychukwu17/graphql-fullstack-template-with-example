"use client"
import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/app/utils/redux/hook"
import { updateUser } from "@/app/utils/redux/features/userSlice"

// console.log('page loaded', process.env.NEXT_PUBLIC_API_URL, process.env.SECRET_KEY)

export default function HomePage() {
    const userInfo = useAppSelector(state => state.user)
    const reduxDispatch = useAppDispatch()

    // if this updated to yes, that means the user cannot view this page except they are logged in
    const upFunc = useCallback(() => {
        reduxDispatch(updateUser({must_logged_in_to_view_this_page:'yes'}))
    }, [reduxDispatch])

    return (
        <main>
            <div data-testid="home-page-hero">Welcome Home</div>
            {userInfo.loggedIn === 'no' && (
                <button className="p-5 bg-lime-500 mt-5 rounded-md" onClick={() => { upFunc() }} >
                    update must be logged in to yes
                </button>
            )}
        </main>
    )
}