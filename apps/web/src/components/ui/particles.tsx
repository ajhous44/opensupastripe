"use client"

import { useEffect, useRef, useState } from "react"

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

type Circle = {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

export default function Particles({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<Circle[]>([])
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mouseMoveRef = useRef<boolean>(false)
  const canvasSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1

  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 255, 255"
  }

  function remapValue(value: number, start1: number, end1: number, start2: number, end2: number): number {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }

  function clearContext() {
    if (context.current && canvasRef.current) {
      const canvas = canvasRef.current
      context.current.setTransform(1, 0, 0, 1, 0, 0)
      context.current.clearRect(0, 0, canvas.width, canvas.height)
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  function circleParams(): Circle {
    const currentCanvasSize = canvasSizeRef.current
    const x = Math.floor(Math.random() * currentCanvasSize.w)
    const y = Math.floor(Math.random() * currentCanvasSize.h)
    const translateX = 0
    const translateY = 0
    const pSize = Math.floor(Math.random() * 2) + size
    const alpha = 0.5
    const targetAlpha = parseFloat((Math.random() * 0.3 + 0.6).toFixed(1))
    const dx = (Math.random() - 0.5) * 0.1 + vx
    const dy = (Math.random() - 0.5) * 0.1 + vy
    const magnetism = 0.1 + Math.random() * 4
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism }
  }

  function drawCircle(circle: Circle, update = false) {
    if (context.current) {
      const { x, y, translateX, translateY, size: pSize, alpha } = circle
      const drawX = x + translateX
      const drawY = y + translateY

      context.current.beginPath()
      context.current.arc(drawX, drawY, pSize, 0, 2 * Math.PI)
      context.current.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`
      context.current.fill()

      if (!update) {
        circles.current.push(circle)
      }
    }
  }

  function drawParticles() {
    const currentSize = canvasSizeRef.current

    if (!context.current) {
      return
    }

    if (currentSize.w === 0 || currentSize.h === 0) {
      return
    }

    clearContext()

    for (let i = 0; i < quantity; i++) {
      const circle = circleParams()
      drawCircle(circle)
    }
  }

  function animate() {
    if (!context.current) {
      animationFrameRef.current = window.requestAnimationFrame(animate)
      return
    }

    const currentSize = canvasSizeRef.current
    if (currentSize.w === 0 || currentSize.h === 0) {
      return
    }

    if (circles.current.length === 0) {
      drawParticles()
      animationFrameRef.current = window.requestAnimationFrame(animate)
      return
    }

    clearContext()
    circles.current.forEach((circle: Circle, i: number) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        currentSize.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        currentSize.h - circle.y - circle.translateY - circle.size,
      ]
      const closestEdge = edge.reduce((a, b) => Math.min(a, b))
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2))
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge
      }
      circle.x += circle.dx
      circle.y += circle.dy
      circle.translateX += (mousePosition.current.x / (staticity / circle.magnetism) - circle.translateX) / ease
      circle.translateY += (mousePosition.current.y / (staticity / circle.magnetism) - circle.translateY) / ease

      if (circle.x < -circle.size || circle.x > currentSize.w + circle.size || circle.y < -circle.size || circle.y > currentSize.h + circle.size) {
        circles.current.splice(i, 1)
        const newCircle = circleParams()
        drawCircle(newCircle)
      } else {
        drawCircle(
          {
            ...circle,
            x: circle.x,
            y: circle.y,
            translateX: circle.translateX,
            translateY: circle.translateY,
            alpha: circle.alpha,
          },
          true,
        )
      }
    })
    animationFrameRef.current = window.requestAnimationFrame(animate)
  }

  function initCanvas() {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0
      const canvas = canvasRef.current
      const width = canvasContainerRef.current.offsetWidth
      const height = canvasContainerRef.current.offsetHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)

      const newSize = {
        w: width,
        h: height,
      }

      canvasSizeRef.current = newSize
      setCanvasSize(newSize)

      if (newSize.w > 0 && newSize.h > 0 && animationFrameRef.current === null) {
        animate()
      }
    }
  }

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }

    initCanvas()

    const startAnimation = () => {
      const currentSize = canvasSizeRef.current
      if (currentSize.w > 0 && currentSize.h > 0) {
        animate()
      } else {
        setTimeout(startAnimation, 50)
      }
    }
    startAnimation()

    const handleResize = () => {
      initCanvas()
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    // Canvas helpers read mutable refs; listing them would restart the animation loop every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only canvas setup
  }, [color, quantity, staticity, ease, size, refresh])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom

        if (isInside) {
          mousePosition.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          }
          mouseMoveRef.current = true
        }
      }
    }
    const handleMouseLeave = () => {
      mouseMoveRef.current = false
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (canvasSize.w > 0 && canvasSize.h > 0) {
      drawParticles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drawParticles uses refs tied to canvasSize
  }, [canvasSize, quantity])

  return (
    <div className={`pointer-events-none ${className}`} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
