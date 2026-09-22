import type { Variants } from 'motion/react'
import { motion, useAnimation } from 'motion/react'
import { useCallback, useImperativeHandle, useRef } from 'react'

import { cn } from '~/lib/utils'

export interface TimerIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

type TimerIconProps = Omit<React.ComponentProps<'div'>, 'ref'> & {
  ref: React.Ref<TimerIconHandle>
  size?: number
}

const HAND_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  animate: {
    rotate: [0, 360],
    transition: {
      delay: 0.1,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const BUTTON_VARIANTS: Variants = {
  normal: {
    scale: 1,
    y: 0,
  },
  animate: {
    scale: [0.9, 1],
    y: [0, 1, 0],
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export function TimerIcon({
  onMouseEnter,
  onMouseLeave,
  className,
  size = 28,
  ref,
  ...props
}: TimerIconProps) {
  const controls = useAnimation()
  const isControlledRef = useRef(false)

  const startAnimation = useCallback(() => {
    void controls.start('animate').then(() => controls.set('normal'))
  }, [controls])

  useImperativeHandle(ref, () => {
    isControlledRef.current = true

    return {
      startAnimation,
      stopAnimation: () => controls.start('normal'),
    }
  }, [controls, startAnimation])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e)
      } else {
        startAnimation()
      }
    },
    [onMouseEnter, startAnimation]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e)
      } else {
        controls.start('normal')
      }
    },
    [controls, onMouseLeave]
  )

  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.line
          animate={controls}
          initial="normal"
          variants={BUTTON_VARIANTS}
          x1="10"
          x2="14"
          y1="2"
          y2="2"
        />
        <motion.line
          animate={controls}
          initial="normal"
          variants={HAND_VARIANTS}
          x1="12"
          x2="15"
          y1="14"
          y2="11"
          style={{ transformBox: 'view-box', originX: '12px', originY: '14px' }}
        />
        <circle cx="12" cy="14" r="8" />
      </svg>
    </div>
  )
}
