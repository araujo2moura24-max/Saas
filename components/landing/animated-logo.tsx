"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import Image from "next/image"

interface AnimatedLogoProps {
  mouseX: number
  mouseY: number
}

export function AnimatedLogo({ mouseX, mouseY }: AnimatedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const { scrollYProgress } = useScroll()
  
  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 50, 
    damping: 20,
    mass: 1
  })

  // Logo transformations based on scroll
  // Movimento horizontal: vai do centro para a direita, depois volta ao centro
  const logoX = useTransform(smoothProgress, 
    [0, 0.15, 0.3, 0.5, 0.7, 1], 
    [0, 150, -100, 50, -50, 0]
  )
  
  // Movimento vertical: desce conforme o scroll
  const logoY = useTransform(smoothProgress, 
    [0, 0.2, 0.4, 0.6, 0.8, 1], 
    [0, 100, 300, 500, 700, 900]
  )
  
  // Rotacao sutil
  const logoRotate = useTransform(smoothProgress, 
    [0, 0.25, 0.5, 0.75, 1], 
    [0, 15, -10, 20, 0]
  )
  
  // Escala: diminui um pouco no meio da pagina
  const logoScale = useTransform(smoothProgress, 
    [0, 0.3, 0.6, 1], 
    [1, 0.7, 0.5, 0.4]
  )
  
  // Opacidade: mais sutil para não interferir na leitura
  const logoOpacity = useTransform(smoothProgress, 
    [0, 0.2, 0.5, 0.8, 1], 
    [0.6, 0.4, 0.3, 0.2, 0.15]
  )

  // Glow intensity baseado no scroll
  const glowIntensity = useTransform(smoothProgress, 
    [0, 0.3, 0.6, 1], 
    [60, 80, 50, 30]
  )

  // Blur sutil para integrar ao background
  const logoBlur = useTransform(smoothProgress,
    [0, 0.3, 0.6, 1],
    [0, 1, 2, 3]
  )

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Mouse influence (apenas em desktop)
  const mouseInfluenceX = isMobile ? 0 : mouseX * 30
  const mouseInfluenceY = isMobile ? 0 : mouseY * 25

  return (
    <motion.div
      ref={containerRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none"
      style={{
        x: logoX,
        y: logoY,
        rotate: logoRotate,
        scale: logoScale,
        opacity: logoOpacity,
        filter: `blur(${logoBlur}px)`,
      }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transform: `translate(${mouseInfluenceX}px, ${mouseInfluenceY}px)`,
        }}
        className="relative"
      >
        {/* Outer glow rings */}
        <motion.div 
          className="absolute inset-0 -m-16"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full rounded-full border border-cyan-500/20" />
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 -m-12"
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full rounded-full border border-emerald-500/15" />
        </motion.div>

        <motion.div 
          className="absolute inset-0 -m-8"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full rounded-full border border-cyan-400/10" />
        </motion.div>

        {/* Main glow */}
        <motion.div 
          className="absolute inset-0 -m-4 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 70%)`,
            filter: `blur(${glowIntensity}px)`,
          }}
        />

        {/* Pulsing glow */}
        <motion.div 
          className="absolute inset-0 -m-6 rounded-full"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)`,
          }}
        />

        {/* Logo container - using 3D rendered logo */}
        <motion.div 
          className="relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {/* 3D Logo image */}
          <Image 
            src="/logo-3d.jpg" 
            alt="OpsCore" 
            width={160} 
            height={160}
            className="w-full h-full object-cover rounded-full"
            priority
          />

          {/* Shine effect overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 rounded-full"
            animate={{
              x: ["-200%", "200%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 6,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Orbiting particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 
                ? "radial-gradient(circle, rgba(6, 182, 212, 0.8), transparent)"
                : "radial-gradient(circle, rgba(16, 185, 129, 0.8), transparent)",
              top: "50%",
              left: "50%",
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                width: 4 + i,
                height: 4 + i,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#06b6d4" : "#10b981",
                boxShadow: i % 2 === 0 
                  ? "0 0 10px rgba(6, 182, 212, 0.8)"
                  : "0 0 10px rgba(16, 185, 129, 0.8)",
                transform: `translateX(${50 + i * 15}px) translateY(-50%)`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
