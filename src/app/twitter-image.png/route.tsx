import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  try {
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#121212',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* App Interface Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '50px',
            }}
          >
            {/* Header with Logo */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              {/* Logo (static for stability) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '70px',
                  height: '70px',
                  backgroundColor: '#22c55e',
                  borderRadius: '14px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '35px',
                    color: 'white',
                  }}
                >
                  ⏱️
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '6px',
                }}
              >
                ChessTicks
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#a1a1aa',
                }}
              >
                Professional Chess Timer
              </div>
            </div>

            {/* Mock Timer Interface */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
              }}
            >
              {/* Duration Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '30px',
                }}
              >
                {['Blitz', 'Rapid', 'Classical'].map((duration, index) => (
                  <div
                    key={duration}
                    style={{
                      backgroundColor: index === 1 ? '#22c55e' : '#1f1f1f',
                      border: index === 1 ? '2px solid white' : '2px solid #404040',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      minWidth: '100px',
                      textAlign: 'center',
                    }}
                  >
                    {duration}
                  </div>
                ))}
              </div>

              {/* Timer Types */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: '30px',
                }}
              >
                {['Sudden Death', 'Fischer', 'Delay', 'Bronstein'].map((type, index) => (
                  <div
                    key={type}
                    style={{
                      backgroundColor: index === 0 ? '#22c55e' : '#1f1f1f',
                      border: index === 0 ? '2px solid white' : '2px solid #404040',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>

              {/* Feature Highlights */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {['5 Timer Modes', 'Tournament Ready', 'Free & Online'].map((feature) => (
                  <div
                    key={feature}
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: '#22c55e',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* URL */}
            <div
              style={{
                position: 'absolute',
                bottom: '25px',
                right: '30px',
                fontSize: '18px',
                color: '#71717a',
                fontWeight: '500',
              }}
            >
              chessticks.vercel.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    )
    
    return imageResponse
  } catch (error) {
    console.error('Failed to generate image:', error)
    
    // Return a simple fallback response instead of trying to generate an image
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image',
        message: 'Please try again later'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
}
