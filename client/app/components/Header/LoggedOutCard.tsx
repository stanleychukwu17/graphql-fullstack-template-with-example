// "use client"
import Link from "next/link"
import { useCallback } from "react"
import { usePathname, useSearchParams } from 'next/navigation';

import { setPageTransition, updateUrlBeforeLogin } from "@/app/utils/redux/features/siteSlice"
import { useAppDispatch } from "@/app/utils/redux/hook"
import { urlMap } from "@/app/utils/url-mappings"

export default function LoggedOutCard() {
    const dispatch = useAppDispatch()
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Combine pathname with search params if they exist
    const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    // enable page transition loading
    const linkClicked = useCallback(() => {
        dispatch(setPageTransition(true))

        // we do not want to redirect to the login page or the register page
        if (pathname != urlMap.clientAuth.register && pathname != urlMap.clientAuth.login && pathname != urlMap.home) {
            dispatch(updateUrlBeforeLogin(currentPath))
        }
    }, [dispatch, pathname, currentPath])

    return (
        <div className="flex space-x-8 font-semibold text-[16.5px]">
            <div className="">
                <Link href={urlMap.clientAuth.register} onClick={linkClicked}>Register</Link>
            </div>
            <div className="">
                <Link href={urlMap.clientAuth.login} onClick={linkClicked}>Login</Link>
            </div>
        </div>
    )
}