import { useEffect, useState } from 'react'

export function FloatingParticles({ count = 15 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className="floating-particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            opacity: particle.opacity
          }}
        />
      ))}
    </div>
  )
}