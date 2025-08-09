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
          {/* App-like Interface Background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#121212',
            }}
          />

          {/* Mock App Interface */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '60px',
            }}
          >
            {/* Header with Logo */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '50px',
              }}
            >
              {/* Logo (static for stability) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#22c55e',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '40px',
                    color: 'white',
                  }}
                >
                  ⏱️
                </div>
              </div>

              {/* App Title */}
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px',
                }}
              >
                ChessTicks
              </div>
              <div
                style={{
                  fontSize: '18px',
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
                maxWidth: '900px',
              }}
            >
              {/* Duration Section */}
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
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '20px',
                  }}
                >
                  Chess Game Duration - Time Controls
                </div>

                {/* Mock Duration Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                  }}
                >
                  {['Blitz', 'Rapid', 'Classical'].map((duration, index) => (
                    <div
                      key={duration}
                      style={{
                        backgroundColor: index === 1 ? '#22c55e' : '#1f1f1f',
                        border: index === 1 ? '2px solid white' : '2px solid #404040',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600',
                        minWidth: '120px',
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
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '20px',
                  }}
                >
                  Tournament Timer Modes
                </div>

                {/* Mock Timer Type Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  {['Sudden Death', 'Fischer', 'Delay', 'Bronstein', 'Multi-Stage'].map((type, index) => (
                    <div
                      key={type}
                      style={{
                        backgroundColor: index === 0 ? '#22c55e' : '#1f1f1f',
                        border: index === 0 ? '2px solid white' : '2px solid #404040',
                        borderRadius: '10px',
                        padding: '12px 20px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* URL */}
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '40px',
                fontSize: '20px',
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
