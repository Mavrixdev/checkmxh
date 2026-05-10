import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MavrixCheck - Tra cứu danh tính đa nền tảng';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617', // slate-950
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(2,6,23,0) 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            border: '2px solid rgba(34, 211, 238, 0.2)',
            borderRadius: '32px',
            background: 'rgba(15, 23, 42, 0.8)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo / Shield Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: '#06b6d4', // cyan-500
              marginBottom: '40px',
              boxShadow: '0 0 40px rgba(6, 182, 212, 0.4)',
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: '#22d3ee', // cyan-400
              letterSpacing: '-0.02em',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            MavrixCheck
          </div>
          
          <div
            style={{
              fontSize: 38,
              fontWeight: 500,
              color: '#cbd5e1', // slate-300
              textAlign: 'center',
              maxWidth: '850px',
              lineHeight: 1.5,
            }}
          >
            Hệ thống tra cứu thông tin số điện thoại, mạng xã hội và kiểm tra lừa đảo chuyên nghiệp
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8', // sky-400
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.15em',
          }}
        >
          MAVRIXDEV.COM
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
