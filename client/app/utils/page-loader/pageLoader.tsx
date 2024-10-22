"use client"

import { useAppSelector } from '@/app/utils/redux/hook';
import React, { useCallback, useEffect } from 'react'
import {animate, motion, useMotionValue, useTransform} from "framer-motion"

export default function PageTransitionLoader() {
    const { pageTransition } = useAppSelector(state => state.site)
    const progress = useMotionValue(0)
    const scaleX = useTransform(progress, [0, 100], [0, 1])

    // sets what we want to animate, so when we call animationControl.play() it will start the animation
    const animationControl = animate(progress, 100, {duration: 10, })

    const showProgress = useCallback(() => {
        // console.log('showing progress')
        progress.set(0)
        animationControl.play()
    }, [animationControl])

    const hideProgress = useCallback(() => {
        // console.log('hiding progress')
        animationControl.complete()
    }, [animationControl])

    // pause the animation on page-load/re-render
    useEffect(() => {
        animationControl.pause()
    }, [animationControl])

    //
    useEffect(() => {
        if (pageTransition === true) showProgress();
        if (pageTransition === false) hideProgress();
    }, [pageTransition, showProgress, hideProgress])

    return (
        <div className="fixed top-0 left-0 right-0 bottom-auto h-[10px] z-50">
            {
                pageTransition && (
                    <motion.div
                        className="h-2 bg-yellow-600"
                        style={{scaleX, originX: 0}}
                    />
                )
            }
        </div>
    )
}
