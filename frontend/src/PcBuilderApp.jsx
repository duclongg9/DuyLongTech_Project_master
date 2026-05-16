import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Confetti from 'react-confetti';

const API = 'https://duylongtech-project-master.onrender.com/api';

const MOCK_OPTIONS = {
  cpu: ['Intel Core i3-12100F', 'Intel Core i5-12400F', 'Intel Core i7-13700K', 'AMD Ryzen 5 5600X', 'AMD Ryzen 9 7950X3D'],
  gpu: ['GTX 1650 4GB', 'RTX 3060 12GB', 'RTX 4070 12GB', 'RX 6600 8GB', 'RTX 4090 24GB'],
  ram: ['8GB DDR4 3200MHz', '16GB DDR4 3200MHz', '32GB DDR5 6000MHz', '64GB DDR5 6000MHz'],
  ssd: ['256GB SATA SSD', '512GB NVMe Gen3', '1TB NVMe Gen4', '2TB NVMe Gen4']
};

export default function PcBuilderApp({ onBack }) {
  const [config, setConfig] = useState({
    cpu: MOCK_OPTIONS.cpu[1],
    gpu: MOCK_OPTIONS.gpu[1],
    ram: MOCK_OPTIONS.ram[1],
    ssd: MOCK_OPTIONS.ssd[1]
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/pc-builder/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { subject: 'Hiệu năng (CPU)', A: result.performance, fullMark: 100 },
    { subject: 'Đồ họa/Game', A: result.gaming, fullMark: 100 },
    { subject: 'Đa nhiệm (RAM)', A: result.multitasking, fullMark: 100 },
    { subject: 'Tốc độ/Pín', A: result.value, fullMark: 100 }, 
  ] : [];

  const getRankColor = (rank) => {
    if (rank?.includes('Kim Cương')) return '#00F0FF'; // Neon Cyan
    if (rank?.includes('Bạch Kim')) return '#B026FF'; // Neon Purple
    if (rank?.includes('Vàng')) return '#FFD700'; // Neon Gold
    if (rank?.includes('Bạc')) return '#C0C0C0'; // Silver
    return '#FF4500'; // Orange-Red
  };

  const isDiamond = result?.rank?.includes('Kim Cương');

  return (
    <div className="arena-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      
      {isDiamond && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#00F0FF', '#B026FF', '#FF0055']} />}
      
      {/* Background Particles Layer */}
      <div className="particles-overlay"></div>

      <div className="container" style={{ maxWidth: 1200, position: 'relative', zIndex: 10 }}>
        <div className="arena-header">
          <button className="btn-back" onClick={onBack}>&lt; RETURN</button>
          <h2 className="arena-title">
            ⚔️ ĐẤU TRƯỜNG HIỆU NĂNG
          </h2>
          <div style={{ width: 80 }}></div>
        </div>

        <div className="arena-grid">
          
          {/* PANEL TRÁI: THE FORGE */}
          <div className="arena-panel forge-panel">
            <h3 className="panel-title">HỆ THỐNG VŨ KHÍ</h3>
            
            {Object.keys(MOCK_OPTIONS).map(part => (
              <div className="cyber-form-group" key={part}>
                <label className="cyber-label">{part}</label>
                <div className="cyber-select-wrapper">
                  <select 
                    className="cyber-input" 
                    value={config[part]} 
                    onChange={(e) => setConfig({...config, [part]: e.target.value})}
                  >
                    {MOCK_OPTIONS[part].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ))}

            <button 
              className="cyber-btn-cta mt-4" 
              onClick={handleEvaluate}
              disabled={loading}
            >
              {loading ? 'ĐANG PHÂN TÍCH...' : '🔥 KIỂM TRA SỨC MẠNH'}
            </button>
          </div>

          <div className="arena-divider"></div>

          {/* PANEL PHẢI: KẾT QUẢ GAMIFICATION */}
          <div className="arena-panel result-panel">
            {!result && !loading && (
              <div className="hologram-empty">
                <svg viewBox="0 0 100 100" className="holo-core">
                  <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="#00F0FF" strokeWidth="2" strokeDasharray="5,5" />
                  <circle cx="50" cy="50" r="15" fill="none" stroke="#B026FF" strokeWidth="2" />
                  <circle cx="50" cy="50" r="5" fill="#00F0FF" />
                </svg>
                <p>SYSTEM STANDBY. AWAITING INPUT...</p>
              </div>
            )}
            
            {loading && (
              <div className="hologram-loading">
                <div className="scan-line"></div>
                <svg viewBox="0 0 100 100" className="holo-core-active">
                  <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="#FF5A36" strokeWidth="3" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="#FF5A36" strokeWidth="2" strokeDasharray="10,5" className="spin" />
                </svg>
                <p className="glitch-text">SCANNING CORE LOGIC...</p>
              </div>
            )}

            {result && !loading && (
              <div className="result-content">
                <div className="rank-display">
                  <h1 style={{ color: getRankColor(result.rank), textShadow: `0 0 30px ${getRankColor(result.rank)}80` }}>
                    {result.rank}
                  </h1>
                  <div className="score-badge">
                    <span>OVERALL RATING:</span>
                    <strong>{result.score}/100</strong>
                  </div>
                </div>

                <div className="radar-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#1A2A3A" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#00F0FF', fontSize: 11, fontFamily: 'Chakra Petch' }} />
                      <Radar name="Hiệu năng" dataKey="A" stroke={getRankColor(result.rank)} fill={getRankColor(result.rank)} fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="ai-commentary" style={{ borderLeftColor: getRankColor(result.rank) }}>
                  <p>"{result.comment}"</p>
                </div>
                
                <button className="cyber-btn-secondary mt-3">
                  {isDiamond ? '🛒 CHỐT ĐƠN CỖ MÁY NÀY NGAY!' : '🛒 MUA LINH KIỆN NÂNG CẤP'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        /* CYBERPUNK ARENA STYLES */
        .arena-wrapper {
          background-color: #050505;
          background-image: 
            linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          min-height: calc(100vh - 60px);
          padding: 40px 0;
          color: #fff;
          font-family: 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Particles Overlay */
        .particles-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 50% 50%, rgba(176, 38, 255, 0.05) 0%, transparent 70%);
        }

        .arena-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;
        }
        
        .btn-back {
          background: transparent; border: 1px solid #00F0FF; color: #00F0FF;
          padding: 8px 16px; border-radius: 4px; font-family: 'Chakra Petch', sans-serif;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase; font-weight: 700;
        }
        .btn-back:hover { background: rgba(0, 240, 255, 0.1); box-shadow: 0 0 10px rgba(0, 240, 255, 0.5); }

        .arena-title {
          font-family: 'Chakra Petch', sans-serif; font-size: 2.2rem; font-weight: 900;
          text-transform: uppercase; letter-spacing: 4px; margin: 0;
          background: linear-gradient(90deg, #00F0FF, #B026FF, #00F0FF);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; color: transparent;
          text-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
          animation: gradient-shift 3s linear infinite;
          background-size: 200% auto;
        }
        @keyframes gradient-shift { to { background-position: 200% center; } }

        .arena-grid {
          display: flex; gap: 40px; align-items: stretch;
          background: rgba(10, 10, 15, 0.8); border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 16px; box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 240, 255, 0.05);
          backdrop-filter: blur(10px); position: relative;
        }

        .arena-panel {
          flex: 1; padding: 40px; display: flex; flex-direction: column;
        }

        .arena-divider {
          width: 2px; background: linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.5), transparent);
          box-shadow: 0 0 15px #00F0FF; margin: 20px 0;
        }

        .panel-title {
          font-family: 'Chakra Petch', sans-serif; color: #00F0FF; font-size: 1.2rem;
          letter-spacing: 2px; margin-bottom: 30px; border-bottom: 1px solid rgba(0, 240, 255, 0.3);
          padding-bottom: 10px; display: inline-block;
        }

        /* Cyber Form */
        .cyber-form-group { margin-bottom: 24px; }
        .cyber-label {
          display: block; font-family: 'Chakra Petch', sans-serif; font-size: 0.8rem;
          color: #B0B0C0; letter-spacing: 1px; margin-bottom: 8px;
        }
        .cyber-select-wrapper { position: relative; }
        .cyber-select-wrapper::after {
          content: '▼'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          color: #00F0FF; font-size: 0.7rem; pointer-events: none;
        }
        .cyber-input {
          width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 240, 255, 0.3);
          color: #FFF; padding: 14px 16px; font-size: 0.95rem; font-family: 'Segoe UI', sans-serif;
          outline: none; transition: all 0.3s; cursor: pointer; appearance: none;
        }
        .cyber-input:focus {
          border-color: #00F0FF; box-shadow: 0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1);
        }
        .cyber-input option { background: #0A0A0F; color: #FFF; }

        /* Cyber Buttons */
        .cyber-btn-cta {
          width: 100%; background: linear-gradient(45deg, #FF3B00, #FF7B00);
          border: none; color: #FFF; font-family: 'Chakra Petch', sans-serif; font-weight: 900; font-style: italic;
          font-size: 1.2rem; letter-spacing: 2px; padding: 18px; cursor: pointer;
          position: relative; overflow: hidden; transition: all 0.3s;
          box-shadow: 0 0 20px rgba(255, 90, 54, 0.4); text-transform: uppercase;
        }
        .cyber-btn-cta:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 0 30px rgba(255, 90, 54, 0.7);
        }
        .cyber-btn-cta:disabled { opacity: 0.7; cursor: not-allowed; filter: grayscale(50%); }
        .cyber-btn-cta::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-25deg); animation: shine 3s infinite;
        }
        @keyframes shine { 20% { left: 200%; } 100% { left: 200%; } }

        .cyber-btn-secondary {
          width: 100%; background: transparent; border: 1px solid rgba(255, 255, 255, 0.3);
          color: #FFF; font-family: 'Chakra Petch', sans-serif; font-weight: 700;
          font-size: 1rem; letter-spacing: 1px; padding: 14px; cursor: pointer;
          transition: all 0.3s;
        }
        .cyber-btn-secondary:hover { background: rgba(255, 255, 255, 0.1); border-color: #FFF; }

        /* Result Panel Holograms */
        .result-panel { align-items: center; justify-content: center; text-align: center; min-height: 500px; }
        
        .hologram-empty, .hologram-loading {
          display: flex; flex-direction: column; align-items: center; gap: 20px;
          opacity: 0.6; animation: float 4s ease-in-out infinite;
        }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        .holo-core { width: 150px; height: 150px; filter: drop-shadow(0 0 10px #00F0FF); }
        .holo-core-active { width: 150px; height: 150px; filter: drop-shadow(0 0 20px #FF5A36); }
        
        .hologram-empty p { font-family: 'Chakra Petch', sans-serif; color: #00F0FF; letter-spacing: 3px; font-size: 0.9rem; }
        
        .scan-line {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: #FF5A36; box-shadow: 0 0 15px #FF5A36, 0 0 30px #FF5A36;
          animation: scan 2s linear infinite; z-index: 10; pointer-events: none;
        }
        @keyframes scan { 0% { top: 10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
        
        .glitch-text {
          font-family: 'Chakra Petch', sans-serif; color: #FF5A36; letter-spacing: 4px; font-size: 1.1rem;
          animation: glitch 0.2s linear infinite;
        }
        @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 1px); } 40% { transform: translate(-1px, -1px); } 60% { transform: translate(2px, 1px); } 80% { transform: translate(1px, -1px); } 100% { transform: translate(0); } }
        
        .spin { animation: rotate 3s linear infinite; transform-origin: center; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }

        /* Results Display */
        .result-content { width: 100%; animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: none; } }
        
        .rank-display h1 { font-family: 'Chakra Petch', sans-serif; font-size: 4rem; font-weight: 900; margin: 0; text-transform: uppercase; }
        .score-badge {
          display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255,255,255,0.1); padding: 8px 20px; border-radius: 30px; margin-top: 10px;
        }
        .score-badge span { color: #A0A0B0; font-family: 'Chakra Petch', sans-serif; font-size: 0.8rem; }
        .score-badge strong { color: #FFF; font-size: 1.3rem; font-weight: 800; }

        .radar-wrapper { width: 100%; height: 280px; margin: 20px 0; }

        .ai-commentary {
          background: rgba(0, 0, 0, 0.4); padding: 20px; border-radius: 8px;
          border-left: 4px solid; margin-bottom: 20px; font-style: italic; color: #E0E0E8;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
        }

        @media(max-width: 800px) {
          .arena-grid { flex-direction: column; }
          .arena-divider { width: 100%; height: 2px; margin: 0; }
        }
      `}</style>
    </div>
  );
}
