'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string
  fallbackElement?: React.ReactNode
}

export function ImageWithFallback({ src, fallbackElement, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return <>{fallbackElement}</>
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => setError(true)}
    />
  )
}
