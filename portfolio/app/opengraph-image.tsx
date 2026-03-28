import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/config'

export const runtime = 'edge'
export const alt = `${siteConfig.name} — ${siteConfig.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          position: 'relative',
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Name */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          {siteConfig.name}
          <span style={{ color: '#6366F1' }}>.</span>
        </div>

        {/* Role */}
        <div
          style={{
            fontSize: 28,
            color: '#94A3B8',
            fontWeight: 400,
          }}
        >
          {siteConfig.role}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: '#6366F1',
            fontWeight: 500,
            marginTop: 24,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size }
  )
}
