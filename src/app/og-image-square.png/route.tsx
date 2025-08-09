import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  try {
    // Keep this handler lightweight and avoid remote fetches for stability
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
              padding: '80px',
            }}
          >
            {/* Header with Logo */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '60px',
              }}
            >
              {/* Logo (static for stability) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#22c55e',
                  borderRadius: '24px',
                  marginBottom: '30px',
                  boxShadow: '0 16px 40px rgba(34, 197, 94, 0.4)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '60px',
                    color: 'white',
                  }}
                >
                  ⏱️
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                ChessTicks
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#a1a1aa',
                  textAlign: 'center',
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
                maxWidth: '900px',
              }}
            >
              {/* Duration Section */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '50px',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '25px',
                    textAlign: 'center',
                  }}
                >
                  Chess Game Duration
                </div>

                {/* Duration Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                  }}
                >
                  {['Blitz', 'Rapid', 'Classical'].map((duration, index) => (
                    <div
                      key={duration}
                      style={{
                        backgroundColor: index === 1 ? '#22c55e' : '#1f1f1f',
                        border: index === 1 ? '3px solid white' : '3px solid #404040',
                        borderRadius: '16px',
                        padding: '20px 30px',
                        color: 'white',
                        fontSize: '22px',
                        fontWeight: '700',
                        minWidth: '140px',
                        textAlign: 'center',
                      }}
                    >
                      {duration}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timer Types Section */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '40px',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '25px',
                    textAlign: 'center',
                  }}
                >
                  Tournament Timer Modes
                </div>

                {/* Timer Type Buttons Grid */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      justifyContent: 'center',
                    }}
                  >
                    {['Sudden Death', 'Fischer'].map((type, index) => (
                      <div
                        key={type}
                        style={{
                          backgroundColor: index === 0 ? '#22c55e' : '#1f1f1f',
                          border: index === 0 ? '2px solid white' : '2px solid #404040',
                          borderRadius: '12px',
                          padding: '16px 24px',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: '600',
                          textAlign: 'center',
                          minWidth: '140px',
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      justifyContent: 'center',
                    }}
                  >
                    {['Delay', 'Bronstein', 'Multi-Stage'].map((type) => (
                      <div
                        key={type}
                        style={{
                          backgroundColor: '#1f1f1f',
                          border: '2px solid #404040',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: '600',
                          textAlign: 'center',
                          minWidth: '120px',
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* URL */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                fontSize: '24px',
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
        height: 1200,
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
