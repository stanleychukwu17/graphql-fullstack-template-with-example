import type { Metadata } from 'next'
import Header from './components/Header/Header'

import { ApolloWrapper } from '@/app/utils/graphql/apollo-wrapper'
import ReduxProvider from '@/app/utils/redux/provider'
import PageTransitionLoader from '@/app/utils/page-loader/pageLoader'
import { siteName } from '@/app/utils/url-mappings'

// import fonts
import { Inter } from 'next/font/google'

// import stylesheets
import './globals.css'

export const metadata: Metadata = {
    title: siteName,
    description: 'Generated by create next app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="">
                <ApolloWrapper>
                    <ReduxProvider>
                        <PageTransitionLoader />
                        <Header />
                        <main className='titi-font max-container'>
                            {children}
                        </main>
                    </ReduxProvider>
                </ApolloWrapper>
            </body>
        </html>
    )
}