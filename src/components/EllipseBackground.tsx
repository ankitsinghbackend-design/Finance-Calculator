import React from 'react'
import ellipseSvg from '../assets/Ellipse 1.svg'

type EllipseBackgroundProps = {
  className?: string
  style?: React.CSSProperties
}

/**
 * Decorative ellipse background used as a fallback behind hero graphics.
 * Sits at z-0 so Figma hero images (z-auto) appear above it when they load.
 */
export default function EllipseBackground({ className = '', style = {} }: EllipseBackgroundProps) {
  return (
    <img
      src={ellipseSvg}
      alt=""
      aria-hidden
      className={`pointer-events-none select-none absolute hidden xl:block ${className || ''}`}
      style={{
        width: '680px',
        height: '680px',
        transform: 'rotate(-90.569deg)',
        aspectRatio: '1 / 1',
        zIndex: 0,
        right: '-80px',
        top: '-40px',
        ...style
      }}
    />
  )
}
