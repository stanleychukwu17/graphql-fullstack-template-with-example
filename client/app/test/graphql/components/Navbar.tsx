import Link from "next/link"

export default function Navbar() {
    return (
        <nav className="flex py-3 font-bold text-[#0056b6]">
            <div className="">
                <Link href="/test/graphql/games">Games</Link>
            </div>
        </nav>
    )
}