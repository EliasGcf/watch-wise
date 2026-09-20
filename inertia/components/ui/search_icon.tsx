import { cn } from '~/lib/utils'
import type { Variants } from 'motion/react'
import { LazyMotion, domMin, m, useAnimation, useReducedMotion } from 'motion/react'
import { useCallback, useImperativeHandle, useRef } from 'react'

export interface SearchIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

type SearchIconProps = React.ComponentProps<typeof m.div> & {
  ref: React.Ref<SearchIconHandle>
  size?: number
  duration?: number
  isAnimated?: boolean
  color?: string
}

export function SearchIcon({
  onMouseEnter,
  onMouseLeave,
  className,
  size = 24,
  duration = 1,
  isAnimated = true,
  color,
  ref,
  ...props
}: SearchIconProps) {
  const controls = useAnimation()
  const reduced = useReducedMotion()
  const isControlled = useRef(false)

  useImperativeHandle(ref, () => {
    isControlled.current = true
    return {
      startAnimation: () => {
        if (reduced) return controls.start('normal')

        controls.set('normal')
        return controls.start('animate')
      },
      stopAnimation: () => controls.start('normal'),
    }
  })

  const handleEnter = useCallback(
    (e?: React.MouseEvent<HTMLDivElement>) => {
      if (!isAnimated || reduced) return
      if (!isControlled.current) controls.start('animate')
      else onMouseEnter?.(e as any)
    },
    [controls, reduced, isAnimated, onMouseEnter]
  )

  const handleLeave = useCallback(
    (e?: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlled.current) controls.start('normal')
      else onMouseLeave?.(e as any)
    },
    [controls, onMouseLeave]
  )

  const lensVariants: Variants = {
    normal: { x: 0, y: 0, rotate: 0, opacity: 1 },
    animate: {
      x: [0, 2, -2, 1, 0],
      y: [0, -1, 2, -1, 0],
      rotate: [0, 6, -6, 4, 0],
      transition: {
        duration: 1.2 * duration,
        ease: 'easeInOut' as const,
      },
    },
  }

  return (
    <LazyMotion features={domMin} strict>
      <m.div
        className={cn('flex items-center justify-center', className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...props}
        style={{ color, ...props.style }}
      >
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={controls}
          initial="normal"
        >
          <m.g variants={lensVariants}>
            <m.circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.34-4.34" />
          </m.g>
        </m.svg>
      </m.div>
    </LazyMotion>
  )
}
