"use client"

import { useEffect, useRef, useCallback, useState } from "react"

interface Point {
  x: number
  y: number
  age: number
  scale: number
  opacity: number
  vx: number // velocity x
  vy: number // velocity y
}

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()
  const lastPointRef = useRef({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  const MAX_POINTS = 30
  const POINT_LIFETIME = 80 // frames
  const MIN_DISTANCE = 6 // pixels between points

  const addPoint = useCallback((x: number, y: number) => {
    const dx = x - lastPointRef.current.x
    const dy = y - lastPointRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > MIN_DISTANCE) {
      // Calculate velocity based on mouse movement
      const vx = (x - prevMouseRef.current.x) * 0.1
      const vy = (y - prevMouseRef.current.y) * 0.1

      pointsRef.current.push({
        x,
        y,
        age: 0,
        scale: 1,
        opacity: 1,
        vx,
        vy,
      })

      if (pointsRef.current.length > MAX_POINTS) {
        pointsRef.current.shift()
      }

      lastPointRef.current = { x, y }
    }

    prevMouseRef.current = { x, y }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw points
    const points = pointsRef.current
    const survivingPoints: Point[] = []

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      point.age++

      // Apply slight drift based on velocity
      point.x += point.vx * 0.5
      point.y += point.vy * 0.5
      point.vx *= 0.95 // decay
      point.vy *= 0.95

      const lifeRatio = point.age / POINT_LIFETIME
      if (lifeRatio >= 1) continue

      // Easing for smooth fade - cubic ease out
      const easedLife = 1 - Math.pow(lifeRatio, 3)
      point.opacity = easedLife
      point.scale = 0.2 + easedLife * 0.8

      // Index-based sizing (newer points are bigger)
      const indexRatio = i / points.length
      const baseSize = 2 + indexRatio * 5

      // Draw point
      const size = baseSize * point.scale
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, size * 2.5
      )

      // Cyan/emerald brand colors with better blending
      gradient.addColorStop(0, `rgba(6, 182, 212, ${point.opacity * 0.9})`)
      gradient.addColorStop(0.4, `rgba(16, 185, 129, ${point.opacity * 0.5})`)
      gradient.addColorStop(0.7, `rgba(6, 182, 212, ${point.opacity * 0.2})`)
      gradient.addColorStop(1, `rgba(6, 182, 212, 0)`)

      ctx.beginPath()
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Add glow effect for newer points
      if (indexRatio > 0.6) {
        const glowGradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 3
        )
        glowGradient.addColorStop(0, `rgba(6, 182, 212, ${point.opacity * 0.2})`)
        glowGradient.addColorStop(1, `rgba(6, 182, 212, 0)`)
        
        ctx.beginPath()
        ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()
      }

      survivingPoints.push(point)
    }

    pointsRef.current = survivingPoints

    // Draw connecting lines between recent points
    if (survivingPoints.length > 1) {
      ctx.beginPath()
      ctx.moveTo(survivingPoints[0].x, survivingPoints[0].y)

      for (let i = 1; i < survivingPoints.length; i++) {
        const point = survivingPoints[i]
        const prevPoint = survivingPoints[i - 1]

        // Quadratic curve for smoother lines
        const midX = (prevPoint.x + point.x) / 2
        const midY = (prevPoint.y + point.y) / 2
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
      }

      const lastPoint = survivingPoints[survivingPoints.length - 1]
      ctx.lineTo(lastPoint.x, lastPoint.y)

      ctx.strokeStyle = `rgba(6, 182, 212, 0.15)`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [])

  // Check for mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    // Don't run on mobile
    if (isMobile) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size with device pixel ratio for crisp rendering
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      addPoint(e.clientX, e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [addPoint, animate, isMobile])

  // Don't render on mobile
  if (isMobile) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  )
}
