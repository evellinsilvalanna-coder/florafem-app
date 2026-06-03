import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const phaseInfo = {
  period: { label: 'Menstruação', color: 'var(--period)', bg: '#fff0f5', emoji: '🩸' },
  fertile: { label: 'Janela Fértil', color: 'var(--fertile)', bg: '#f0fff4', emoji: '🌱' },
  ovulation: { label: 'Dia da Ovulação', color: 'var(--ovulation)', bg: '#fff8f0', emoji: '⭐' },
  luteal: { label: 'Fase Lútea', color: '#9C27B0', bg: '#f9f0ff', emoji: '🌙' },
  follicular: { label: 'Fase Folicular', color: '#2196F3', bg: '#f0f8ff', emoji: '🌸' },
};

function CircularProgress({ value, max, size = 140, strokeWidth = 12, color, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / max) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>{children}</div>
    </div>
  );
}

function StatCard({ emoji, label, value, sub, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || 'var(--primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function PregnancyChanceBadge({ chance, percent }) {
  const config = {
    low: { color: '#4CAF50', bg: '#E8F5E9', label: 'Baixa' },
    medium: { color: '#FF9800', bg: '#FFF3E0', label: 'Média' },
    high: { color: '#E91E8C', bg: '#FCE4EC', label: 'Alta ✨' },
  };
  const c = config[chance] || config.low;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: c.bg, padding: '8px 16px', borderRadius: 99,
      border: `2px solid ${c.color}`,
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, animation: chance === 'high' ? 'pulse 2s infinite' : 'none' }} />
      <span style={{ fontWeight: 700, color: c.color, fontSize: 14 }}>Chance de gravidez: {c.label} ({percent}%)</span>
    </div>
  );
}

function TodaySymptoms({ dateStr, data }) {
  const symptoms = data.symptoms[dateStr] || {};
  const moods = data.moods[dateStr] || [];
  const allSymptoms = Object.values(symptoms).flatMap(s => Object.keys(s).filter(k => s[k]));
  const symptomEmojis = { cramps: '😣', headache: '🤕', bloating: '🫄', nausea: '🤢', breast_pain: '💔', fatigue: '😴', acne: '😮', back_pain: '🔙', discharge: '💧', sleep_changes: '😵' };
  const moodEmojis = { happy: '😊', sad: '😢', anxious: '😰', angry: '😠', sensitive: '🥺', stressed: '😤', motivated: '💪', tired: '😴' };
  if (allSymptoms.length === 0 && moods.length === 0) return null;
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>📝 Registros de hoje</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {moods.map(m => (
          <span key={m.mood} style={{ background: 'var(--primary-soft)', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
            {moodEmojis[m.mood] || '😊'} {m.mood}
          </span>
        ))}
        {allSymptoms.map(s => (
          <span key={s} style={{ background: '#fff8f0', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            {symptomEmojis[s] || '•'} {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function PhaseBar({ cycleData }) {
  if (!cycleData) return null;
  const phases = [
    { name: 'Menstruação', days: `1-${cycleData.periodLength}`, color: 'var(--period)', width: (cycleData.periodLength / cycleData.cycleLength) * 100 },
    { name: 'Folicular', days: '', color: '#2196F3', width: ((cycleData.cycleLength - 14 - cycleData.periodLength - 5) / cycleData.cycleLength) * 100 },
    { name: 'Fértil', days: '5 dias', color: 'var(--fertile)', width: (6 / cycleData.cycleLength) * 100 },
    { name: 'Ovulação', days: '1 dia', color: 'var(--ovulation)', width: (1 / cycleData.cycleLength) * 100 },
    { name: 'Lútea', days: '~14 dias', color: '#9C27B0', width: (13 / cycleData.cycleLength) * 100 },
  ];
  const currentPos = ((cycleData.dayOfCycle - 1) / cycleData.cycleLength) * 100;
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15 }}>🔄 Ciclo Atual</h3>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dia {cycleData.dayOfCycle} de {cycleData.cycleLength}</span>
      </div>
      <div style={{ position: 'relative', borderRadius: 99, overflow: 'hidden', height: 16, display: 'flex' }}>
        {phases.map((p, i) => (
          <div key={i} style={{ width: `${p.width}%`, background: p.color, opacity: 0.8 }} title={p.name} />
        ))}
        <div style={{
          position: 'absolute', top: -4, left: `${currentPos}%`,
          transform: 'translateX(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: 'white', border: '3px solid var(--primary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: 'var(--primary)',
        }}>
          {cycleData.dayOfCycle}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {phases.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NextDates({ cycleData }) {
  if (!cycleData) return null;
  const items = [
    {
      emoji: '🩸', label: 'Próxima menstruação',
      date: format(cycleData.nextPeriod, "d 'de' MMM", { locale: ptBR }),
      days: cycleData.daysToNextPeriod,
      color: 'var(--period)', bg: '#fff0f5',
    },
    {
      emoji: '🌱', label: 'Início da janela fértil',
      date: format(cycleData.fertileStart, "d 'de' MMM", { locale: ptBR }),
      days: cycleData.daysToFertile,
      color: 'var(--fertile)', bg: '#f0fff4',
    },
    {
      emoji: '⭐', label: 'Ovulação estimada',
      date: format(cycleData.ovulationDay, "d 'de' MMM", { locale: ptBR }),
      days: cycleData.daysToOvulation,
      color: 'var(--ovulation)', bg: '#fff8f0',
    },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      {items.map((item, i) => (
        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: item.bg }}>
          <span style={{ fontSize: 28 }}>{item.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{item.date}</div>
          </div>
          <div style={{
            background: item.color, color: 'white',
            borderRadius: 12, padding: '6px 12px',
            textAlign: 'center', minWidth: 56,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
              {item.days <= 0 ? 'Hoje' : item.days}
            </div>
            {item.days > 0 && <div style={{ fontSize: 10, opacity: 0.9 }}>dias</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SetupCard({ updateUser }) {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const handleSave = () => {
    if (!lastPeriod) return;
    updateUser({ lastPeriodStart: lastPeriod, cycleLength, periodLength });
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: 32, marginTop: 24 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🌸</div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Configure seu ciclo</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Para começar, precisamos saber sobre seu ciclo menstrual</p>
      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Início da última menstruação</label>
          <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 12, fontSize: 16, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Duração do ciclo: {cycleLength} dias</label>
          <input type="range" min="21" max="40" value={cycleLength} onChange={e => setCycleLength(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>21 dias</span><span>28 dias</span><span>40 dias</span>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Duração da menstruação: {periodLength} dias</label>
          <input type="range" min="2" max="10" value={periodLength} onChange={e => setPeriodLength(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }} />
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%', marginTop: 8 }}>
          Começar meu acompanhamento 🌸
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { cycleData, data, selectedDate, updateUser, setShowDailyPopup, setActiveTab } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');

  if (!data.user.lastPeriodStart) {
    return <SetupCard updateUser={updateUser} />;
  }

  const getPhase = () => {
    if (!cycleData) return null;
    if (cycleData.isInPeriod) return phaseInfo.period;
    if (cycleData.isOvulation) return phaseInfo.ovulation;
    if (cycleData.isInFertile) return phaseInfo.fertile;
    if (cycleData.dayOfCycle > (cycleData.cycleLength - 14 + 1)) return phaseInfo.luteal;
    return phaseInfo.follicular;
  };
  const phase = getPhase();

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade">
      {/* Hero Card */}
      <div style={{
        background: 'var(--gradient-primary)',
        borderRadius: 28,
        padding: '28px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute', right: 20, bottom: -30,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
          Dia {cycleData?.dayOfCycle} do ciclo
        </h1>
        {phase && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 99, marginBottom: 16 }}>
            <span>{phase.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{phase.label}</span>
          </div>
        )}
        <br />
        {cycleData && <PregnancyChanceBadge chance={cycleData.pregnancyChance} percent={cycleData.pregnancyPercent} />}

        {/* Quick action */}
        <button
          onClick={() => setShowDailyPopup(true)}
          style={{
            marginTop: 20, display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 12, padding: '10px 18px', cursor: 'pointer', color: 'white',
            fontWeight: 700, fontSize: 14,
          }}>
          ✏️ Registrar como me sinto hoje
        </button>
      </div>

      {/* Stats Grid */}
      {cycleData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          <StatCard emoji="📅" label="Próx. menstruação" value={`${cycleData.daysToNextPeriod}d`} sub={format(cycleData.nextPeriod, "d/MM", { locale: ptBR })} color="var(--period)" />
          <StatCard emoji="⭐" label="Ovulação estimada" value={cycleData.daysToOvulation <= 0 ? 'Hoje!' : `${cycleData.daysToOvulation}d`} sub={format(cycleData.ovulationDay, "d/MM", { locale: ptBR })} color="var(--ovulation)" />
          <StatCard emoji="🌱" label="Início janela fértil" value={cycleData.daysToFertile <= 0 ? 'Agora!' : `${cycleData.daysToFertile}d`} sub="5 dias férteis" color="var(--fertile)" />
          <StatCard emoji="♻️" label="Duração do ciclo" value={`${cycleData.cycleLength}d`} sub="regularidade 85%" color="#9C27B0" />
        </div>
      )}

      {/* Today Symptoms */}
      <TodaySymptoms dateStr={today} data={data} />

      {/* Phase Bar */}
      {cycleData && <PhaseBar cycleData={cycleData} />}

      {/* Next Dates */}
      {cycleData && <NextDates cycleData={cycleData} />}

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>⚡ Ações rápidas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { emoji: '🩸', label: 'Menstruação', tab: 'log' },
            { emoji: '💕', label: 'Atividade sexual', tab: 'log' },
            { emoji: '🌡️', label: 'Sintomas', tab: 'log' },
            { emoji: '📅', label: 'Calendário', tab: 'calendar' },
            { emoji: '📊', label: 'Relatórios', tab: 'reports' },
            { emoji: '👫', label: 'Parceiro', tab: 'profile' },
          ].map((a, i) => (
            <button key={i} onClick={() => setActiveTab(a.tab)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 8px', border: '2px solid var(--border)',
                borderRadius: 16, background: 'var(--bg)', cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: 26 }}>{a.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TTC Tip */}
      {data.user.ttcMode && cycleData && (
        <div className="card" style={{ marginTop: 16, background: 'linear-gradient(135deg, #fff0f5 0%, #f3e5f5 100%)', border: '2px solid var(--primary-light)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 32 }}>🤰</span>
            <div>
              <h3 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 4 }}>Modo Tentante Ativo</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {cycleData.isInFertile
                  ? '🌟 Você está na janela fértil! Este é o melhor momento para tentar engravidar. Boa sorte!'
                  : cycleData.daysToFertile > 0
                    ? `Sua janela fértil começa em ${cycleData.daysToFertile} dia${cycleData.daysToFertile > 1 ? 's' : ''}. Aproveite para se preparar!`
                    : 'Continue registrando para análises mais precisas da sua fertilidade.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
