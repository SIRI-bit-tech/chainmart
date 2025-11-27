"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface Node {
  x: number
  y: number
  baseX: number
  baseY: number
  radius: number
  color: string
  pulsePhase: number
  pulseSpeed: number
}

interface Particle {
  x: number
  y: number
  progress: number
  speed: number
  color: string
  fromNode: number
  toNode: number
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  active: boolean
}

export function BlockchainNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Colors
    const colors = {
      indigo: "#6366F1",
      purple: "#8B5CF6",
      brightPurple: "#A855F7",
      cyan: "#22D3EE",
      blue: "#3B82F6",
    }

    // Initialize nodes in diamond/hexagonal pattern
    const initNodes = () => {
      const nodes: Node[] = []
      const nodeColors = [colors.indigo, colors.purple, colors.brightPurple]
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.45 // Increased from 0.35 to 0.45

      // Create diamond/hexagonal grid pattern
      const layers = 5
      let nodeIndex = 0

      for (let layer = 0; layer < layers; layer++) {
        const nodesInLayer = layer === 0 ? 1 : layer * 6
        const layerRadius = (radius / layers) * (layer + 1)

        for (let i = 0; i < nodesInLayer; i++) {
          const angle = (i / nodesInLayer) * Math.PI * 2
          const baseX = centerX + Math.cos(angle) * layerRadius
          const baseY = centerY + Math.sin(angle) * layerRadius

          nodes.push({
            x: baseX,
            y: baseY,
            baseX,
            baseY,
            radius: layer === 0 ? 5 : 3,
            color: nodeColors[nodeIndex % nodeColors.length],
            pulsePhase: (nodeIndex / 40) * Math.PI * 2,
            pulseSpeed: 0.015,
          })
          nodeIndex++
        }
      }

      nodesRef.current = nodes
    }

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = []
      const particleColors = [colors.cyan, colors.blue]

      for (let i = 0; i < 30; i++) {
        const fromNode = i % nodesRef.current.length
        const toNode = (i + 5) % nodesRef.current.length

        particles.push({
          x: nodesRef.current[fromNode].x,
          y: nodesRef.current[fromNode].y,
          progress: (i / 30),
          speed: 0.003,
          color: particleColors[i % particleColors.length],
          fromNode,
          toNode,
        })
      }
      particlesRef.current = particles
    }

    // Initialize background stars
    const initStars = () => {
      const stars: Star[] = []
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        })
      }
      starsRef.current = stars
    }

    // Initialize shooting stars
    const initShootingStars = () => {
      const shootingStars: ShootingStar[] = []
      for (let i = 0; i < 5; i++) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 3 + 2,
          angle: Math.random() * Math.PI / 4 + Math.PI / 4, // 45-90 degrees
          opacity: 0,
          active: false,
        })
      }
      shootingStarsRef.current = shootingStars
    }

    initNodes()
    initParticles()
    initStars()
    initShootingStars()

    // Mouse move handler for parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Draw node with glow
    const drawNode = (node: Node, pulseScale: number) => {
      // Outer glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4 * pulseScale)
      gradient.addColorStop(0, node.color + "80")
      gradient.addColorStop(0.5, node.color + "20")
      gradient.addColorStop(1, node.color + "00")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * 4 * pulseScale, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.fillStyle = node.color
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2)
      ctx.fill()

      // Inner glow
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * 0.5 * pulseScale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw connection line
    const drawConnection = (node1: Node, node2: Node, distance: number) => {
      const maxDistance = 200
      const opacity = Math.max(0, 1 - distance / maxDistance)

      const gradient = ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y)
      const hex1 = Math.floor(opacity * 120).toString(16).padStart(2, "0")
      const hex2 = Math.floor(opacity * 100).toString(16).padStart(2, "0")
      gradient.addColorStop(0, colors.indigo + hex1)
      gradient.addColorStop(0.5, colors.purple + hex1)
      gradient.addColorStop(1, colors.brightPurple + hex2)

      ctx.strokeStyle = gradient
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(node1.x, node1.y)
      ctx.lineTo(node2.x, node2.y)
      ctx.stroke()
    }

    // Draw particle
    const drawParticle = (particle: Particle) => {
      // Outer glow
      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 6)
      gradient.addColorStop(0, particle.color + "FF")
      gradient.addColorStop(0.5, particle.color + "80")
      gradient.addColorStop(1, particle.color + "00")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw background star
    const drawStar = (star: Star) => {
      const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw shooting star
    const drawShootingStar = (shootingStar: ShootingStar) => {
      if (!shootingStar.active) return

      const gradient = ctx.createLinearGradient(
        shootingStar.x,
        shootingStar.y,
        shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
        shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
      )
      gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`)
      gradient.addColorStop(0.5, `rgba(200, 200, 255, ${shootingStar.opacity * 0.5})`)
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(shootingStar.x, shootingStar.y)
      ctx.lineTo(
        shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
        shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
      )
      ctx.stroke()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      timeRef.current += 0.008 // Slower rotation

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw background stars
      starsRef.current.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed
        drawStar(star)
      })

      // Update and draw shooting stars
      shootingStarsRef.current.forEach((shootingStar) => {
        if (!shootingStar.active && Math.random() < 0.001) {
          // Randomly activate shooting star
          shootingStar.active = true
          shootingStar.x = Math.random() * canvas.width
          shootingStar.y = Math.random() * canvas.height * 0.5
          shootingStar.opacity = 1
        }

        if (shootingStar.active) {
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed
          shootingStar.opacity -= 0.01

          if (shootingStar.opacity <= 0 || shootingStar.x > canvas.width || shootingStar.y > canvas.height) {
            shootingStar.active = false
          }

          drawShootingStar(shootingStar)
        }
      })

      // Rotate the entire network
      const rotationAngle = timeRef.current * 0.5

      // Update and draw nodes
      nodesRef.current.forEach((node, i) => {
        // Calculate rotated position
        const dx = node.baseX - centerX
        const dy = node.baseY - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const originalAngle = Math.atan2(dy, dx)
        const newAngle = originalAngle + rotationAngle

        // Apply rotation
        node.x = centerX + Math.cos(newAngle) * distance
        node.y = centerY + Math.sin(newAngle) * distance

        // Add gentle pulsing
        const pulse = Math.sin(timeRef.current * 2 + i * 0.5) * 3
        node.x += Math.cos(newAngle) * pulse
        node.y += Math.sin(newAngle) * pulse

        // Add subtle mouse parallax
        const parallaxStrength = 0.015
        node.x += mouseRef.current.x * parallaxStrength
        node.y += mouseRef.current.y * parallaxStrength

        // Update pulse
        node.pulsePhase += node.pulseSpeed
        const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.25

        // Draw connections to nearby nodes
        nodesRef.current.forEach((otherNode, j) => {
          if (i >= j) return
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 200) {
            drawConnection(node, otherNode, distance)
          }
        })

        // Draw node
        drawNode(node, pulseScale)
      })

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.progress += particle.speed

        if (particle.progress >= 1) {
          // Reached target, pick new target
          particle.fromNode = particle.toNode
          particle.toNode = (particle.toNode + 5) % nodesRef.current.length
          particle.progress = 0
        }

        const fromNode = nodesRef.current[particle.fromNode]
        const toNode = nodesRef.current[particle.toNode]

        // Smooth interpolation
        const easeProgress = particle.progress * particle.progress * (3 - 2 * particle.progress)
        particle.x = fromNode.x + (toNode.x - fromNode.x) * easeProgress
        particle.y = fromNode.y + (toNode.y - fromNode.y) * easeProgress

        drawParticle(particle)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // GSAP entrance animation
    gsap.fromTo(
      canvas,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          animate()
        },
      }
    )

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ background: "transparent" }}
    />
  )
}
