import type { Metadata } from 'next'
import Navbar from './components/Navbar'


export const metadata: Metadata = {
    title: 'GraphQl and Next.js',
    description: 'Making sure my graphql is working',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className='max-container'>
            <Navbar />
            {children}
        </section>
    )
}