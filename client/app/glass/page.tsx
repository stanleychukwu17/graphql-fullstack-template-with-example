import React from 'react'

import './page.scss'

export default function page() {
    return (
        <div className="container">
            <div className="glassmorphic-card">
                <h1>Glassmorphism</h1>
                <p>This is a card with a glassmorphic design!</p>
            </div>
            <div className="grain-overlay"></div>
        </div>
    )
}
