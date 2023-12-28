import Link from "next/link"

export default function LoggedOutCard() {
    return (
        <div className="flex space-x-8 font-semibold text-[16.5px]">
            <div className="">
                <Link href="/login">Register</Link>
            </div>
            <div className="">
                <Link href="/login">Login</Link>
            </div>
        </div>
    )
}