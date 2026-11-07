import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Bot,
  User,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { chatAPI } from '../services/api';

const PROJECT_TOPICS = [
  { label: '📋 Project Overview', query: 'About this project' },
  { label: '🧪 How to Remove Heavy Metals', query: 'What are the best water treatment methods to remove heavy metals? Does boiling help?' },
  { label: '⚠️ Health Hazards & Diseases', query: 'What diseases and health hazards are caused by heavy metal poisoning?' },
  { label: '💧 What is HPI & HEI?', query: 'What is HPI and how is HEI calculated?' },
  { label: '🔬 WHO vs BIS Limits', query: 'Show heavy metal standards table WHO vs BIS' },
  { label: '🏭 Causes & Pollution Sources', query: 'What are the main causes and industrial sources of heavy metal water pollution?' },
  { label: '👁️ Can You Smell/Taste Metals?', query: 'Can I smell, taste, or see heavy metals in drinking water?' },
  { label: '💊 Chelation Therapy', query: 'What is chelation therapy and medical treatment for heavy metal poisoning?' },
  { label: '☢️ Fluoride & Uranium', query: 'What are the health risks of fluoride and uranium in groundwater?' },
  { label: '🤖 ML Risk Prediction', query: 'How does the ML risk model work?' },
  { label: '🚨 Critical Hotspots', query: 'Which districts have the highest contamination?' },
  { label: '🐟 Bioaccumulation & Food Chain', query: 'How does heavy metal bioaccumulation and biomagnification occur in aquatic life?' },
  { label: '🔬 Lab Testing (AAS / ICP-MS)', query: 'How are heavy metals tested in certified laboratories?' },
];

const SHORT_PROJECT_POPUPS = [
  {
    id: 1,
    tag: 'AquaIndex',
    emoji: '👋',
    title: 'AquaIndex AI Active',
    desc: 'Surveillance across 10 districts',
    query: 'About this project',
  },
  {
    id: 2,
    tag: '500 Samples',
    emoji: '💧',
    title: '500 Water Sources Monitored',
    desc: 'Groundwater, Surface & Municipal',
    query: 'Show summary of water samples and districts',
  },
  {
    id: 3,
    tag: 'Formulas',
    emoji: '📐',
    title: 'Prasad & Bose HPI / HEI',
    desc: 'Live pollution indexing formulas',
    query: 'What is HPI and how is HEI calculated?',
  },
  {
    id: 4,
    tag: 'AI / ML',
    emoji: '🤖',
    title: 'ML Risk Prediction',
    desc: 'Ensemble contamination model',
    query: 'How does the ML risk model work?',
  },
  {
    id: 5,
    tag: 'Standards',
    emoji: '🔬',
    title: 'WHO & BIS IS 10500',
    desc: 'Automatic threshold checks',
    query: 'Show heavy metal standards table WHO vs BIS',
  },
];

const INITIAL_MESSAGE = {
  id: 'init-1',
  sender: 'bot',
  text: `👋 Hello! I am **AquaBot**, your AI water surveillance & environmental chemistry specialist for **AquaIndex**.

### **Ask Me Anything About Heavy Metals & Water Pollution!**
I can provide authoritative scientific guidance on:
- 🧪 **Water Treatment & Filtration Technologies:** Reverse Osmosis (RO), Ion Exchange, Chemical Precipitation, Adsorption, and why boiling does *not* remove metals.
- ⚠️ **Health Hazards & Toxicology:** Carcinogenesis, Itai-Itai (Cadmium), Blackfoot Disease (Arsenic), Minamata Syndrome (Mercury), and Manganism.
- 📐 **Pollution Index Calculations:** Prasad & Bose (2001) HPI and Edet & Offiong (2002) HEI formulas and classification scales.
- 🔬 **Permissible Standards:** Comparison against **WHO 4th Edition Guidelines** and **BIS IS 10500:2012**.
- 🏭 **Pollution Sources & Geochemistry:** Industrial electroplating, acid mine drainage, agricultural runoff, and pH/TDS interactions.
- 📊 **AquaIndex Surveillance Dataset:** 500 validated samples across 10 industrial and agricultural districts.

Ask any question below or tap a quick topic to get started!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'system',
};

const AquaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState('');

  // Radial Hover Burst State (5 satellite popup cards fan out around the circle on hover, matching sketch)
  const [isRadialHovered, setIsRadialHovered] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const radialTimerRef = useRef(null);

  const handleRadialMouseEnter = () => {
    if (radialTimerRef.current) {
      clearTimeout(radialTimerRef.current);
      radialTimerRef.current = null;
    }
    if (!isOpen && !isDragging) {
      setIsRadialHovered(true);
    }
  };

  const handleRadialMouseLeave = () => {
    if (radialTimerRef.current) clearTimeout(radialTimerRef.current);
    radialTimerRef.current = setTimeout(() => {
      setIsRadialHovered(false);
      setHoveredCardIndex(null);
    }, 280);
  };

  const handleRadialCardClick = (query) => {
    setIsRadialHovered(false);
    setHoveredCardIndex(null);
    setIsOpen(true);
    handleSend(query);
  };

  // Helper for responsive button dimension
  const getButtonDimension = () => {
    if (typeof window === 'undefined') return 44;
    return window.innerWidth <= 480 ? 36 : window.innerWidth <= 768 ? 38 : 44;
  };

  // Draggable Button Position State { x, y }
  const [position, setPosition] = useState(() => {
    const btnDim = typeof window !== 'undefined' ? (window.innerWidth <= 480 ? 36 : window.innerWidth <= 768 ? 38 : 44) : 44;
    try {
      const saved = localStorage.getItem('aquabot_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.max(10, Math.min(window.innerWidth - btnDim - 10, parsed.x)),
            y: Math.max(10, Math.min(window.innerHeight - btnDim - 10, parsed.y)),
          };
        }
      }
    } catch {
      // fallback
    }
    return {
      x: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - btnDim - 14) : 100,
      y: typeof window !== 'undefined' ? Math.max(10, window.innerHeight - btnDim - 14) : 100,
    };
  });

  const [isDragging, setIsDragging] = useState(false);

  // Refs for drag tracking
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    btnStartX: 0,
    btnStartY: 0,
    hasMoved: false,
    active: false,
  });

  const buttonRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Keep button within window on resize
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setViewportWidth(vw);
      const btnDim = vw <= 480 ? 36 : vw <= 768 ? 38 : 44;
      setPosition((prev) => ({
        x: Math.max(10, Math.min(vw - btnDim - 10, prev.x)),
        y: Math.max(10, Math.min(window.innerHeight - btnDim - 10, prev.y)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      textareaRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  // Handle Drag Events (Mouse & Touch)
  const onPointerDown = useCallback((clientX, clientY) => {
    setIsRadialHovered(false);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      btnStartX: position.x,
      btnStartY: position.y,
      hasMoved: false,
      active: true,
    };
  }, [position]);

  const onPointerMove = useCallback((clientX, clientY) => {
    if (!dragRef.current.active) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;

    if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
      dragRef.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragRef.current.hasMoved) {
      const btnDim = window.innerWidth <= 480 ? 36 : window.innerWidth <= 768 ? 38 : 44;
      const maxX = window.innerWidth - btnDim - 10;
      const maxY = window.innerHeight - btnDim - 10;
      const newX = Math.max(10, Math.min(maxX, dragRef.current.btnStartX + dx));
      const newY = Math.max(10, Math.min(maxY, dragRef.current.btnStartY + dy));
      setPosition({ x: newX, y: newY });
    }
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    const wasDragging = dragRef.current.hasMoved;
    dragRef.current.active = false;
    setIsDragging(false);

    if (wasDragging) {
      // Save updated position
      setPosition((curr) => {
        try {
          localStorage.setItem('aquabot_pos', JSON.stringify(curr));
        } catch {
          // ignore
        }
        return curr;
      });
    } else {
      // It was a click/tap: toggle chat
      setIsOpen((prev) => {
        const next = !prev;
        if (next) setIsRadialHovered(false);
        return next;
      });
    }
  }, []);

  // Mouse Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Primary button only
    e.preventDefault();
    onPointerDown(e.clientX, e.clientY);

    const handleMouseMove = (moveEvent) => {
      onPointerMove(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      onPointerUp();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    onPointerDown(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current.active || e.touches.length !== 1) return;
    if (dragRef.current.hasMoved) {
      e.preventDefault(); // Stop mobile scroll when dragging
    }
    const touch = e.touches[0];
    onPointerMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    onPointerUp();
  };

  // Send message
  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setError(null);
    setLastUserMessage(text);
    setIsRadialHovered(false);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'init-1')
        .slice(-6)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      const res = await chatAPI.sendMessage(text, history);

      if (res.success && res.message) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: res.source,
          modelUsed: res.modelUsed,
          notice: res.notice,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(res.message || 'Received unexpected response from chatbot service.');
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to reach AquaBot server. Please check connection.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
    setInput('');
  };

  const handleAutoAssistTrigger = (query) => {
    setIsRadialHovered(false);
    setIsOpen(true);
    handleSend(query);
  };

  // Helper to calculate adaptive panel placement with clear distance from draggable button
  const getPanelStyle = () => {
    if (typeof window === 'undefined') return {};
    const isMobile = (viewportWidth || window.innerWidth) <= 850;
    if (isMobile) return {}; // Mobile floating card styled by CSS

    const btnDim = 44;
    const gap = 20; // Clear visible distance between button and chat panel
    const panelWidth = Math.min(420, window.innerWidth - btnDim - gap - 32);
    const panelHeight = Math.min(580, window.innerHeight - 36);

    let left;
    let top;

    // Check horizontal clearance to the right and left of the button
    const spaceRight = window.innerWidth - (position.x + btnDim + gap);
    const spaceLeft = position.x - gap;

    if (position.x > window.innerWidth / 2) {
      // Right side of screen -> place panel to the LEFT of button with 20px gap
      if (spaceLeft >= panelWidth) {
        left = position.x - panelWidth - gap;
      } else {
        left = Math.max(16, position.x + btnDim + gap);
      }
    } else {
      // Left side of screen -> place panel to the RIGHT of button with 20px gap
      if (spaceRight >= panelWidth) {
        left = position.x + btnDim + gap;
      } else {
        left = Math.max(16, position.x - panelWidth - gap);
      }
    }

    // Keep left within viewport margins
    left = Math.max(16, Math.min(window.innerWidth - panelWidth - 16, left));

    // Vertical placement: align top near button but ensure it's comfortably on screen
    const idealTop = position.y - 12;
    top = Math.max(16, Math.min(window.innerHeight - panelHeight - 16, idealTop));

    // Fallback if panel overlaps horizontally: place above or below with 20px gap
    const buttonRight = position.x + btnDim;
    const panelRight = left + panelWidth;
    const horizontalOverlap = !(panelRight < position.x || left > buttonRight);

    if (horizontalOverlap) {
      if (position.y > window.innerHeight / 2) {
        top = Math.max(16, position.y - panelHeight - gap);
      } else {
        top = Math.min(window.innerHeight - panelHeight - 16, position.y + btnDim + gap);
      }
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${panelWidth}px`,
      height: `${panelHeight}px`,
      bottom: 'auto',
      right: 'auto',
    };
  };

  // Helper to calculate adaptive angles matching user's hand-drawn radial sketch:
  // 1: Top-Left (-130°), 2: Top-Right (-45°), 3: Right (+10°), 4: Bottom (+85°), 5: Bottom-Left (+155°)
  const getRadialAngles = (posX, posY, windowW, windowH) => {
    const isNearRight = posX > windowW - 220;
    const isNearLeft = posX < 220;
    const isNearBottom = posY > windowH - 220;
    const isNearTop = posY < 220;

    if (isNearRight && isNearBottom) {
      return [-180, -158, -135, -112, -90];
    }
    if (isNearLeft && isNearBottom) {
      return [-90, -68, -45, -22, 0];
    }
    if (isNearRight && isNearTop) {
      return [90, 112, 135, 158, 180];
    }
    if (isNearLeft && isNearTop) {
      return [0, 22, 45, 68, 90];
    }
    if (isNearRight) {
      return [-155, -125, -90, -55, 145];
    }
    if (isNearLeft) {
      return [-45, -15, 15, 45, 75];
    }
    if (isNearBottom) {
      return [-170, -130, -90, -50, -10];
    }
    if (isNearTop) {
      return [10, 50, 90, 130, 170];
    }

    return [-130, -45, 10, 85, 155];
  };

  // Helper to calculate geometry for the 5 satellite cards and connector lines
  const getRadialGeometry = () => {
    if (typeof window === 'undefined') return { cards: [], lines: [] };

    const btnDim = window.innerWidth <= 480 ? 36 : window.innerWidth <= 768 ? 38 : 44;
    const btnCenterX = position.x + btnDim / 2;
    const btnCenterY = position.y + btnDim / 2;
    const btnRadius = btnDim / 2;

    const isMobile = window.innerWidth <= 768;
    const radius = isMobile ? 115 : 142;
    const cardHalfW = isMobile ? 70 : 82;
    const cardHalfH = isMobile ? 24 : 28;

    const angles = getRadialAngles(position.x, position.y, window.innerWidth, window.innerHeight);

    const cards = [];
    const lines = [];

    SHORT_PROJECT_POPUPS.forEach((item, idx) => {
      const deg = angles[idx % angles.length];
      const rad = (deg * Math.PI) / 180;

      const targetX = btnCenterX + radius * Math.cos(rad);
      const targetY = btnCenterY + radius * Math.sin(rad);

      const clampedX = Math.max(cardHalfW + 8, Math.min(window.innerWidth - cardHalfW - 8, targetX));
      const clampedY = Math.max(cardHalfH + 8, Math.min(window.innerHeight - cardHalfH - 8, targetY));

      const dx = clampedX - btnCenterX;
      const dy = clampedY - btnCenterY;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      const lineX1 = btnCenterX + (btnRadius + 3) * ux;
      const lineY1 = btnCenterY + (btnRadius + 3) * uy;

      const lineX2 = clampedX - (cardHalfH + 6) * ux;
      const lineY2 = clampedY - (cardHalfH + 6) * uy;

      cards.push({
        ...item,
        index: idx,
        x: clampedX,
        y: clampedY,
        angle: deg,
      });

      lines.push({
        index: idx,
        x1: lineX1,
        y1: lineY1,
        x2: lineX2,
        y2: lineY2,
      });
    });

    return { cards, lines, btnCenterX, btnCenterY };
  };

  // Helper to render simple markdown formatting
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const flushTable = (key) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(2);
        elements.push(
          <div key={`table-${key}`} className="aquabot-table-wrapper">
            <table className="aquabot-table">
              <thead>
                <tr>
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Table line detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim().replace(/\*\*(.*?)\*\*/g, '$1'));
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // H4 Header
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h5 key={idx} className="aquabot-heading-sm">
            {trimmed.replace('#### ', '').replace(/\*\*/g, '')}
          </h5>
        );
        return;
      }

      // H3 Header
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="aquabot-heading">
            {trimmed.replace('### ', '').replace(/\*\*/g, '')}
          </h4>
        );
        return;
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        elements.push(
          <li key={idx} className="aquabot-list-item">
            {formatInline(content)}
          </li>
        );
        return;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="aquabot-quote">
            {formatInline(trimmed.substring(2))}
          </blockquote>
        );
        return;
      }

      // Empty line
      if (trimmed === '') {
        elements.push(<div key={idx} style={{ height: '0.4rem' }} />);
        return;
      }

      // Standard paragraph
      elements.push(
        <p key={idx} className="aquabot-paragraph">
          {formatInline(line)}
        </p>
      );
    });

    if (inTable) {
      flushTable('end');
    }

    return elements;
  };

  // Helper for inline bold, code, and symbols
  const formatInline = (text) => {
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="aquabot-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }

      const subParts = part.split(/(\*\*[^*]+\*\*)/g);
      return subParts.map((sub, sIdx) => {
        if (sub.startsWith('**') && sub.endsWith('**')) {
          return (
            <strong key={`${pIdx}-${sIdx}`} style={{ color: '#f8fafc', fontWeight: 600 }}>
              {sub.slice(2, -2)}
            </strong>
          );
        }
        return sub;
      });
    });
  };

  return (
    <>
      {/* Draggable Floating Button Wrapper */}
      <div
        id="aquabot-draggable-container"
        className={`aquabot-drag-wrapper ${isDragging ? 'is-dragging' : ''} ${isOpen ? 'chat-is-open' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Radial Hover Burst of 5 Satellite Cards Connected by Lines (Matching User Sketch) */}
        {isRadialHovered && !isOpen && !isDragging && (() => {
          const { cards, lines } = getRadialGeometry();
          return (
            <div
              className="aquabot-radial-overlay"
              onMouseEnter={handleRadialMouseEnter}
              onMouseLeave={handleRadialMouseLeave}
            >
              {/* SVG Connecting Lines between Central Chatbot and 5 Satellite Cards */}
              <svg className="aquabot-radial-lines" xmlns="http://www.w3.org/2000/svg">
                {lines.map((line) => {
                  const isCardActive = hoveredCardIndex === line.index;
                  return (
                    <g key={line.index}>
                      <line
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        className={`aquabot-radial-line ${isCardActive ? 'active' : ''}`}
                      />
                      <circle
                        cx={line.x1}
                        cy={line.y1}
                        r={isCardActive ? 3.5 : 2.5}
                        className={`aquabot-radial-dot ${isCardActive ? 'active' : ''}`}
                      />
                      <circle
                        cx={line.x2}
                        cy={line.y2}
                        r={isCardActive ? 3.5 : 2.5}
                        className={`aquabot-radial-dot ${isCardActive ? 'active' : ''}`}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* 5 Radial Satellite Cards Numbered 1 to 5 exactly like the user's sketch */}
              {cards.map((card) => {
                const isCardActive = hoveredCardIndex === card.index;
                return (
                  <div
                    key={card.id}
                    className={`aquabot-radial-card ${isCardActive ? 'active' : ''}`}
                    style={{
                      left: `${card.x}px`,
                      top: `${card.y}px`,
                      animationDelay: `${card.index * 35}ms`,
                    }}
                    onMouseEnter={() => {
                      handleRadialMouseEnter();
                      setHoveredCardIndex(card.index);
                    }}
                    onMouseLeave={() => setHoveredCardIndex(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRadialCardClick(card.query);
                    }}
                    role="button"
                    tabIndex={0}
                    title={`Click to ask: "${card.query}"`}
                  >
                    <div className="aquabot-radial-card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="aquabot-radial-num">{card.index + 1}</span>
                        <span className="aquabot-radial-emoji">{card.emoji}</span>
                      </div>
                      <span className="aquabot-radial-tag">{card.tag}</span>
                    </div>
                    <div className="aquabot-radial-title">{card.title}</div>
                    <div className="aquabot-radial-desc">{card.desc}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Circular Logo Button (Logo is ALWAYS visible, with active glow when chat is open) */}
        <button
          ref={buttonRef}
          id="aquabot-toggle-btn"
          className={`aquabot-floating-btn ${isOpen ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleRadialMouseEnter}
          onMouseLeave={handleRadialMouseLeave}
          aria-label={isOpen ? 'Minimize AquaBot AI' : 'Open AquaBot AI Assistant (Draggable)'}
          title={isOpen ? 'AquaBot AI Active (Click to minimize)' : 'AquaBot AI • Water Quality Assistant (Drag anywhere)'}
        >
          <div className="aquabot-logo-circle">
            <svg
              className="aquabot-logo-svg"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="aquaLogoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              {/* Outer orbital ring */}
              <circle cx="20" cy="20" r="18" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Water droplet silhouette */}
              <path
                d="M20 7C20 7 11 17.5 11 23C11 27.97 15.03 32 20 32C24.97 32 29 27.97 29 23C29 17.5 20 7 20 7Z"
                fill="rgba(255, 255, 255, 0.22)"
              />
              {/* Robot face */}
              <rect x="14" y="19" width="12" height="9" rx="3" fill="#ffffff" />
              {/* Robot eyes */}
              <circle cx="17" cy="23.5" r="1.3" fill="#0891b2" />
              <circle cx="23" cy="23.5" r="1.3" fill="#0891b2" />
              {/* Antenna */}
              <path d="M20 16V19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="20" cy="15" r="1.5" fill="#ffffff" />
              {/* Subtle smile */}
              <path d="M18 26C18.6 26.6 21.4 26.6 22 26" stroke="#0891b2" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className={`aquabot-pulse-badge ${isOpen ? 'active-pulse' : ''}`} />
            {!isRadialHovered && !isOpen && (
              <span className="aquabot-hover-tooltip">
                AquaBot AI • <span style={{ opacity: 0.75 }}>Drag to move</span>
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Adaptive Chat Panel & Backdrop */}
      {isOpen && (
        <>
          <div
            className="aquabot-mobile-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="aquabot-panel"
            style={getPanelStyle()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="aquabot-title"
          >
            {/* Mobile Sheet Handle */}
            <div className="aquabot-sheet-handle" />

            {/* Panel Header */}
            <div className="aquabot-header">
              <div className="aquabot-header-info">
              <div className="aquabot-avatar">
                <svg
                  className="aquabot-header-logo-svg"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="aquaHeaderGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <circle cx="20" cy="20" r="18" stroke="rgba(34, 211, 238, 0.45)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path
                    d="M20 7C20 7 11 17.5 11 23C11 27.97 15.03 32 20 32C24.97 32 29 27.97 29 23C29 17.5 20 7 20 7Z"
                    fill="url(#aquaHeaderGrad)"
                    fillOpacity="0.25"
                  />
                  <rect x="14" y="19" width="12" height="9" rx="3" fill="#ffffff" />
                  <circle cx="17" cy="23.5" r="1.3" fill="#0891b2" />
                  <circle cx="23" cy="23.5" r="1.3" fill="#0891b2" />
                  <path d="M20 16V19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="20" cy="15" r="1.5" fill="#ffffff" />
                  <path d="M18 26C18.6 26.6 21.4 26.6 22 26" stroke="#0891b2" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <h3 id="aquabot-title" className="aquabot-title">AquaBot AI</h3>
                  <span className="aquabot-online-pill">
                    <span className="aquabot-status-dot" /> Online
                  </span>
                </div>
                <div className="aquabot-subtitle">AquaIndex Surveillance & Chemical Assistant</div>
              </div>
            </div>

            <div className="aquabot-header-actions">
              <button
                type="button"
                className="aquabot-icon-btn"
                onClick={handleClearHistory}
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className="aquabot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize AquaBot"
                aria-label="Close AquaBot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Project Auto-Assist Quick Topics Carousel / Bar */}
          <div className="aquabot-suggestions">
            <div className="aquabot-suggestions-title">
              <Sparkles size={13} style={{ color: 'var(--primary)' }} />
              <span>Project Auto-Assist & Quick Intelligence</span>
            </div>
            <div className="aquabot-chips-scroll">
              {PROJECT_TOPICS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className="aquabot-chip"
                  onClick={() => handleSend(item.query)}
                  disabled={loading}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="aquabot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`aquabot-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="aquabot-message-avatar bot">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`aquabot-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <div className="aquabot-bubble-text">{renderFormattedText(msg.text)}</div>

                  <div className="aquabot-bubble-footer">
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="aquabot-source-tag">
                        {msg.source === 'openai' ? 'OpenAI GPT' : 'AquaIndex Knowledge'}
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="aquabot-message-avatar user">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="aquabot-message-row bot-row">
                <div className="aquabot-message-avatar bot">
                  <Bot size={15} />
                </div>
                <div className="aquabot-bubble bot-bubble loading">
                  <div className="aquabot-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Analyzing water quality parameters & dataset...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="aquabot-error-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.8rem', color: '#fca5a5' }}>{error}</span>
                </div>
                <button type="button" className="aquabot-retry-btn" onClick={handleRetry}>
                  <RefreshCw size={13} /> Retry Query
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form & Footer */}
          <div className="aquabot-footer">
            <div className="aquabot-input-wrapper">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about heavy metals, pollution, treatment, diseases, HPI/HEI..."
                rows={1}
                maxLength={1000}
                className="aquabot-textarea"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="aquabot-send-btn"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>

            <div className="aquabot-disclaimer">
              <ShieldCheck size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>
                Screening surveillance. Water safety decisions require certified laboratory AAS/ICP-MS validation.
              </span>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
};

export default AquaBot;
