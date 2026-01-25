import { useState } from 'react'

export default function HelpTooltip({ text, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' },
  }

  return (
    <span 
      className="help-tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      <span className="help-tooltip-icon">?</span>
      
      {isVisible && (
        <div className="help-tooltip-bubble" style={positions[position]}>
          {text}
          <div className={`help-tooltip-arrow help-tooltip-arrow-${position}`}></div>
        </div>
      )}

      <style>{`
        .help-tooltip-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 6px;
          cursor: help;
        }

        .help-tooltip-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--border);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .help-tooltip-icon:hover {
          background: var(--accent);
          color: var(--primary);
        }

        .help-tooltip-bubble {
          position: absolute;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-primary);
          white-space: normal;
          width: 250px;
          max-width: 300px;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          animation: tooltipFadeIn 0.2s ease;
        }

        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .help-tooltip-arrow {
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transform: rotate(45deg);
        }

        .help-tooltip-arrow-top {
          bottom: -6px;
          left: 50%;
          margin-left: -5px;
          border-top: none;
          border-left: none;
        }

        .help-tooltip-arrow-bottom {
          top: -6px;
          left: 50%;
          margin-left: -5px;
          border-bottom: none;
          border-right: none;
        }

        .help-tooltip-arrow-left {
          right: -6px;
          top: 50%;
          margin-top: -5px;
          border-bottom: none;
          border-left: none;
        }

        .help-tooltip-arrow-right {
          left: -6px;
          top: 50%;
          margin-top: -5px;
          border-top: none;
          border-right: none;
        }
      `}</style>
    </span>
  )
}
