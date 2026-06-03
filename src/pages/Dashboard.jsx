import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ── Gauge circular ── */
function CircularGauge({ value, max, size = 130, stroke = 14, color, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.34,1.56,.64,1)', filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Pill de fase ── */
function PhasePill({ phase }) {
  const map = {
    period:     { label: 'Menstruação',   color: 'var(--period)',    soft: 'var(--period-soft)',    emoji: '🩸' },
    ovulation:  { label: 'Ovulação',      color: 'var(--ovulation)', soft: 'var(--ovulation-soft)', emoji: '⭐' },
    fertile:    { label: 'Janela Fértil', color: 'var(--fertile)',   soft: 'var(--fertile-soft)',   emoji: '🌱' },
    luteal:     { label: 'Fase Lútea',    color: 'var(--luteal)',    soft: 'var(--purple-soft)',    emoji: '🌙' },
    follicular: { label: 'Fase Folicular',color: 'var(--follicular)',soft: '#E3F2FD',               emoji: '🌸' },
  };
  const p = map[phase] || map.follicular;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.35)',
      borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: 'white',
    }}>
      <span>{p.emoji}</span><span>{p.label}</span>
    </span>
  );
}

/* ── Card de próxima data ── */
function NextDateCard({ emoji, label, date, daysLeft, color, bg, delay }) {
  return (
    <div className={`card animate-fade delay-${delay}`} style={{ background: bg, border: `1.5px solid ${color}30`, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0, boxShadow: `0 4px 16px ${color}50`,
        }}>{emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{date}</div>
        </div>
        <div style={{
          minWidth: 52, padding: '8px 10px', borderRadius: 12,
          background: color, color: 'white', textAlign: 'center',
          boxShadow: `0 4px 16px ${color}40`,
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{daysLeft <= 0 ? '🎯' : daysLeft}</div>
          {daysLeft > 0 && <div style={{ fontSize: 9, opacity: 0.9, marginTop: 1, fontWeight: 700 }}>DIAS</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Barra de fase do ciclo ── */
function CycleBar({ cycleData }) {
  if (!cycleData) return null;
  const { dayOfCycle, cycleLength, periodLength } = cycleData;
  const ovDay = cycleLength - 14;
  const fertStart = ovDay - 5;
  const pct = ((dayOfCycle - 1) / cycleLength) * 100;

  const segments = [
    { label: 'Menstruação',  from: 0,         to: periodLength / cycleLength,    color: 'var(--period)' },
    { label: 'Folicular',    from: periodLength / cycleLength, to: fertStart / cycleLength, color: 'var(--follicular)' },
    { label: 'Fértil',       from: fertStart / cycleLength, to: ovDay / cycleLength, color: 'var(--fertile)' },
    { label: 'Ovulação',     from: ovDay / cycleLength, to: (ovDay + 1) / cycleLength, color: 'var(--ovulation)' },
    { label: 'Lútea',        from: (ovDay + 1) / cycleLength, to: 1,             color: 'var(--luteal)' },
  ];

  return (
    <div className="card animate-fade delay-4" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>🔄 Ciclo atual</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Dia {dayOfCycle} / {cycleLength}</div>
      </div>

      {/* Barra */}
      <div style={{ position: 'relative', height: 18, borderRadius: 99, overflow: 'visible', display: 'flex', marginBottom: 16 }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            width: `${(s.to - s.from) * 100}%`, height: '100%',
            background: s.color, opacity: 0.85,
            borderRadius: i === 0 ? '99px 0 0 99px' : i === segments.length - 1 ? '0 99px 99px 0' : 0,
          }} />
        ))}
        {/* Cursor */}
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 28, height: 28,
          borderRadius: '50%',
          background: 'white',
          border: '3px solid var(--pink)',
          boxShadow: '0 2px 12px var(--pink-glow), 0 0 0 4px rgba(240,40,122,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: 'var(--pink)',
          zIndex: 2,
        }}>{dayOfCycle}</div>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 3, background: s.color }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Registro de hoje ── */
function TodayLog({ data }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const moods = data.moods[today] || [];
  const symptoms = data.symptoms[today] || {};
  const physSymptoms = Object.keys(symptoms.physical || {}).filter(k => symptoms.physical[k]);
  const health = data.health[today] || {};

  const moodEmoji = { happy:'😊', sad:'😢', anxious:'😰', angry:'😠', sensitive:'🥺', stressed:'😤', motivated:'💪', tired:'😴', calm:'😌', confident:'😎' };

  if (!moods.length && !physSymptoms.length && !health.water && !health.sleep) return null;

  return (
    <div className="card animate-fade delay-5" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Registros de hoje</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {moods.map(m => (
          <span key={m.mood} style={{ padding: '6px 12px', borderRadius: 99, background: 'var(--pink-soft)', color: 'var(--pink)', fontSize: 13, fontWeight: 700 }}>
            {moodEmoji[m.mood] || '😊'} {m.mood}
          </span>
        ))}
        {physSymptoms.map(s => (
          <span key={s} style={{ padding: '6px 12px', borderRadius: 99, background: 'var(--peach-soft)', color: 'var(--peach)', fontSize: 13, fontWeight: 700 }}>
            • {s}
          </span>
        ))}
        {health.water && (
          <span style={{ padding: '6px 12px', borderRadius: 99, background: '#E3F2FD', color: '#1565C0', fontSize: 13, fontWeight: 700 }}>
            💧 {health.water} copos
          </span>
        )}
        {health.sleep && (
          <span style={{ padding: '6px 12px', borderRadius: 99, background: 'var(--purple-soft)', color: 'var(--purple)', fontSize: 13, fontWeight: 700 }}>
            😴 {health.sleep}h sono
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Setup card ── */
function SetupCard({ updateUser }) {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  return (
    <div style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-float" style={{ fontSize: 80, marginBottom: 16 }}>🌸</div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }} className="text-gradient">Bem-vinda ao FloraFem</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15, lineHeight: 1.6 }}>Vamos configurar seu ciclo para começar o acompanhamento personalizado</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
              📅 Início da última menstruação
            </label>
            <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>♻️ Duração do ciclo</label>
              <span style={{ fontWeight: 800, color: 'var(--pink)', fontSize: 16 }}>{cycleLength}d</span>
            </div>
            <input type="range" min="21" max="40" value={cycleLength} onChange={e => setCycleLength(+e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>🩸 Duração da menstruação</label>
              <span style={{ fontWeight: 800, color: 'var(--pink)', fontSize: 16 }}>{periodLength}d</span>
            </div>
            <input type="range" min="2" max="10" value={periodLength} onChange={e => setPeriodLength(+e.target.value)} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}
            onClick={() => lastPeriod && updateUser({ lastPeriodStart: lastPeriod, cycleLength, periodLength })}>
            Começar meu acompanhamento 🌸
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Quick actions ── */
function QuickActions({ setActiveTab, setShowDailyPopup }) {
  const actions = [
    { emoji: '🩸', label: 'Menstruação', tab: 'log',       color: 'var(--period)' },
    { emoji: '💕', label: 'Atividade',   tab: 'log',       color: 'var(--pink)' },
    { emoji: '😊', label: 'Humor',       popup: true,      color: '#9C27B0' },
    { emoji: '📅', label: 'Calendário',  tab: 'calendar',  color: '#2196F3' },
    { emoji: '📊', label: 'Relatórios',  tab: 'reports',   color: '#FF7B54' },
    { emoji: '👫', label: 'Parceiro',    tab: 'profile',   color: 'var(--fertile)' },
  ];

  return (
    <div className="card animate-fade delay-5" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>⚡ Ações rápidas</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {actions.map((a, i) => (
          <button key={i}
            onClick={() => a.popup ? setShowDailyPopup(true) : setActiveTab(a.tab)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '14px 8px', border: '1.5px solid var(--border)',
              borderRadius: 16, background: 'var(--bg)',
              cursor: 'pointer', transition: 'all var(--t-spring)', fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = a.color;
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `${a.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{a.emoji}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textAlign: 'center' }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════ */
export default function Dashboard() {
  const { cycleData, data, updateUser, setShowDailyPopup, setActiveTab } = useApp();

  if (!data.user.lastPeriodStart) return <SetupCard updateUser={updateUser} />;

  const getPhase = () => {
    if (!cycleData) return 'follicular';
    if (cycleData.isInPeriod) return 'period';
    if (cycleData.isOvulation) return 'ovulation';
    if (cycleData.isInFertile) return 'fertile';
    if (cycleData.dayOfCycle > cycleData.cycleLength - 14) return 'luteal';
    return 'follicular';
  };
  const phase = getPhase();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const chanceColor = cycleData?.pregnancyChance === 'high' ? 'var(--fertile)' : cycleData?.pregnancyChance === 'medium' ? 'var(--ovulation)' : 'var(--text-3)';
  const chanceLabel = cycleData?.pregnancyChance === 'high' ? 'Alta ✨' : cycleData?.pregnancyChance === 'medium' ? 'Média' : 'Baixa';

  return (
    <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Hero Card ── */}
      <div className="card-gradient animate-fade" style={{ zIndex: 1 }}>
        {/* Data */}
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 6, fontWeight: 600, textTransform: 'capitalize', position: 'relative', zIndex: 1 }}>{today}</p>

        {/* Fase */}
        <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <PhasePill phase={phase} />
        </div>

        {/* Gauge + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
          {cycleData && (
            <CircularGauge value={cycleData.dayOfCycle} max={cycleData.cycleLength} size={110} stroke={11} color="rgba(255,255,255,0.9)">
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>{cycleData.dayOfCycle}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>de {cycleData.cycleLength}</div>
            </CircularGauge>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Dia do ciclo</div>
            <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
              {cycleData?.isOvulation ? 'Ovulação hoje! ⭐' : cycleData?.isInFertile ? 'Período fértil! 🌱' : cycleData?.isInPeriod ? 'Menstruando 🩸' : `Fase ${phase}`}
            </div>
            {cycleData && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 99, padding: '7px 14px',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cycleData.pregnancyChance === 'high' ? '#00C896' : cycleData.pregnancyChance === 'medium' ? '#FFB300' : 'rgba(255,255,255,0.5)', animation: cycleData.pregnancyChance === 'high' ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Chance: {chanceLabel} ({cycleData.pregnancyPercent}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <button onClick={() => setShowDailyPopup(true)} style={{
          marginTop: 18, width: '100%',
          background: 'rgba(255,255,255,0.18)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          borderRadius: 14, padding: '12px 20px',
          cursor: 'pointer', color: 'white',
          fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all var(--t)', fontFamily: 'inherit',
          position: 'relative', zIndex: 1,
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
        >
          ✏️ Como estou me sentindo hoje?
        </button>
      </div>

      {/* ── Stats ── */}
      {cycleData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { emoji: '🩸', label: 'Próx. menstruação', value: `${cycleData.daysToNextPeriod}d`, sub: format(cycleData.nextPeriod, 'd/MM', { locale: ptBR }), color: 'var(--period)' },
            { emoji: '⭐', label: 'Ovulação', value: cycleData.daysToOvulation <= 0 ? 'Hoje!' : `${cycleData.daysToOvulation}d`, sub: format(cycleData.ovulationDay, 'd/MM', { locale: ptBR }), color: 'var(--ovulation)' },
            { emoji: '🌱', label: 'Janela fértil', value: cycleData.daysToFertile <= 0 ? 'Ativa!' : `${cycleData.daysToFertile}d`, sub: '5 dias férteis', color: 'var(--fertile)' },
            { emoji: '♻️', label: 'Regularidade', value: '85%', sub: `${cycleData.cycleLength} dias`, color: 'var(--purple)' },
          ].map((s, i) => (
            <div key={i} className={`card animate-fade delay-${i + 1}`}
              style={{ textAlign: 'center', padding: '18px 12px', cursor: 'default' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, margin: '0 auto 10px',
                background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{s.emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', margin: '5px 0 3px' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Próximas datas ── */}
      {cycleData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <NextDateCard emoji="🩸" label="Próxima menstruação" date={format(cycleData.nextPeriod, "d 'de' MMM", { locale: ptBR })} daysLeft={cycleData.daysToNextPeriod} color="var(--period)" bg="var(--period-soft)" delay={1} />
          <NextDateCard emoji="🌱" label="Início da janela fértil" date={format(cycleData.fertileStart, "d 'de' MMM", { locale: ptBR })} daysLeft={cycleData.daysToFertile} color="var(--fertile)" bg="var(--fertile-soft)" delay={2} />
          <NextDateCard emoji="⭐" label="Ovulação estimada" date={format(cycleData.ovulationDay, "d 'de' MMM", { locale: ptBR })} daysLeft={cycleData.daysToOvulation} color="var(--ovulation)" bg="var(--ovulation-soft)" delay={3} />
        </div>
      )}

      {/* ── Registros de hoje ── */}
      <TodayLog data={data} />

      {/* ── Barra de ciclo ── */}
      {cycleData && <CycleBar cycleData={cycleData} />}

      {/* ── Ações rápidas ── */}
      <QuickActions setActiveTab={setActiveTab} setShowDailyPopup={setShowDailyPopup} />

      {/* ── TTC Banner ── */}
      {data.user.ttcMode && cycleData && (
        <div className="card animate-fade" style={{
          background: 'linear-gradient(135deg, var(--fertile-soft) 0%, var(--purple-soft) 100%)',
          border: '1.5px solid var(--fertile)',
        }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16, flexShrink: 0,
              background: 'var(--grad-fertile)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, boxShadow: '0 4px 16px rgba(0,200,150,0.35)',
            }}>🤰</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#007A5E', marginBottom: 4 }}>Modo Tentante Ativo</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                {cycleData.isInFertile
                  ? '🌟 Você está na janela fértil! Melhor momento para tentar.'
                  : cycleData.daysToFertile > 0
                    ? `Janela fértil em ${cycleData.daysToFertile} dia${cycleData.daysToFertile > 1 ? 's' : ''}. Se prepare! 💪`
                    : 'Continue registrando para análises mais precisas. 📊'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
