import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

function FertilityGauge({ percent, label, color }) {
  const strokeWidth = 14;
  const size = 160;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const offset = arc - (percent / 100) * arc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="var(--border)" strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference}`} strokeLinecap="round" />
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color }}>{percent}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function FertilityTimeline({ cycleData }) {
  if (!cycleData) return null;
  const { periodStart, periodEnd, fertileStart, fertileEnd, ovulationDay, nextPeriod, cycleLength } = cycleData;
  
  const days = eachDayOfInterval({
    start: periodStart,
    end: addDays(periodStart, cycleLength - 1),
  });

  const getStatus = (date) => {
    const d = date.getTime();
    if (d >= periodStart.getTime() && d <= periodEnd.getTime()) return 'period';
    if (d === ovulationDay.getTime()) return 'ovulation';
    if (d >= fertileStart.getTime() && d <= fertileEnd.getTime()) return 'fertile';
    return 'normal';
  };

  const statusColors = {
    period: '#E91E8C',
    ovulation: '#FF9800',
    fertile: '#4CAF50',
    normal: 'var(--border)',
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>📅 Linha do tempo do ciclo</h3>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {days.map((day, i) => {
          const status = getStatus(day);
          const isToday = day.getTime() === today.getTime();
          const isPast = day < today;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: statusColors[status],
                opacity: isPast && !isToday ? 0.5 : 1,
                border: isToday ? '3px solid var(--text-primary)' : '3px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: status === 'normal' ? 'var(--text-muted)' : 'white',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#E91E8C', label: 'Menstruação' },
          { color: '#4CAF50', label: 'Janela fértil' },
          { color: '#FF9800', label: 'Ovulação' },
          { color: 'var(--border)', label: 'Neutro' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemperatureChart({ temperatures }) {
  if (temperatures.length < 2) return null;
  const last14 = temperatures.slice(-14);
  const data = last14.map(t => ({
    date: format(new Date(t.date + 'T12:00:00'), 'd/MM'),
    temp: t.temp,
  }));

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>🌡️ Temperatura Basal (Últimos {last14.length} dias)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E91E8C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
            formatter={(v) => [`${v}°C`, 'Temperatura']}
          />
          <ReferenceLine y={36.5} stroke="#4CAF50" strokeDasharray="4 4" label={{ value: 'Pré-ovulatório', fontSize: 11 }} />
          <ReferenceLine y={37.0} stroke="#FF9800" strokeDasharray="4 4" label={{ value: 'Pós-ovulatório', fontSize: 11 }} />
          <Area type="monotone" dataKey="temp" stroke="#E91E8C" strokeWidth={2} fill="url(#tempGrad)" dot={{ fill: '#E91E8C', r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
        💡 A temperatura sobe ~0.2-0.5°C após a ovulação
      </p>
    </div>
  );
}

function TTCStats({ data, cycleData }) {
  const ttcAttempts = data.sexActivity.filter(s => s.type === 'ttc' || s.type === 'unprotected');
  const thisMonthAttempts = ttcAttempts.filter(s => {
    const d = new Date(s.date + 'T12:00:00');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const fertileDayAttempts = cycleData ? ttcAttempts.filter(s => {
    const d = new Date(s.date + 'T12:00:00');
    return d >= cycleData.fertileStart && d <= addDays(cycleData.ovulationDay, 1);
  }).length : 0;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>🤰 Estatísticas — Modo Tentante</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Tentativas este mês', value: thisMonthAttempts.length, emoji: '📅', color: 'var(--primary)' },
          { label: 'No período fértil', value: fertileDayAttempts, emoji: '🌱', color: 'var(--fertile)' },
          { label: 'Total de tentativas', value: ttcAttempts.length, emoji: '💕', color: '#9C27B0' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--bg-secondary)', borderRadius: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FertilityAdvice({ cycleData }) {
  if (!cycleData) return null;
  const { isInFertile, isOvulation, daysToFertile, daysToOvulation, isInPeriod } = cycleData;

  const advices = [];
  if (isInPeriod) {
    advices.push({ emoji: '💜', text: 'Descanse e cuide de você. A ovulação ainda está longe.' });
    advices.push({ emoji: '🥗', text: 'Alimentos ricos em ferro ajudam a repor as perdas do fluxo.' });
  } else if (isOvulation) {
    advices.push({ emoji: '⭐', text: 'Hoje é seu dia mais fértil! A chance de concepção é máxima.' });
    advices.push({ emoji: '🛌', text: 'Fique deitada por 10-15min após a relação para ajudar os espermatozoides.' });
    advices.push({ emoji: '😌', text: 'Evite estresse — ele pode afetar a implantação do embrião.' });
  } else if (isInFertile) {
    advices.push({ emoji: '🌱', text: 'Você está na janela fértil! Ótimo momento para tentar engravidar.' });
    advices.push({ emoji: '💧', text: 'Beba bastante água para manter a fluidez do muco cervical.' });
    advices.push({ emoji: '🏃', text: 'Exercícios moderados são benéficos — evite excessos.' });
  } else if (daysToFertile > 0 && daysToFertile <= 5) {
    advices.push({ emoji: '⏰', text: `Sua janela fértil começa em ${daysToFertile} dia${daysToFertile > 1 ? 's' : ''}! Comece a se preparar.` });
    advices.push({ emoji: '💊', text: 'Continue tomando ácido fólico se estiver tentando engravidar.' });
  } else {
    advices.push({ emoji: '📊', text: 'Continue registrando sintomas para análises mais precisas.' });
    advices.push({ emoji: '🧘', text: 'Pratique atividades que reduzam o estresse. Bom para a fertilidade!' });
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>💡 Dicas personalizadas</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {advices.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--primary-soft)', borderRadius: 14 }}>
            <span style={{ fontSize: 24 }}>{a.emoji}</span>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HormonalCurve({ cycleData }) {
  if (!cycleData) return null;
  const { cycleLength, dayOfCycle } = cycleData;
  
  const data = Array.from({ length: cycleLength }, (_, i) => {
    const day = i + 1;
    const estrogenPeak = Math.max(0, -0.5 * Math.pow(day - (cycleLength - 14), 2) + 100);
    const progesterone = day > (cycleLength - 14) ? Math.max(0, -0.4 * Math.pow(day - (cycleLength - 7), 2) + 80) : 0;
    const lh = day === (cycleLength - 14) ? 150 : day === (cycleLength - 13) ? 80 : day === (cycleLength - 15) ? 60 : 0;
    return { day, estrogen: Math.max(0, Math.min(100, estrogenPeak)), progesterone: Math.max(0, Math.min(100, progesterone)), lh };
  });

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>📈 Curva hormonal estimada</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Dia do ciclo', position: 'insideBottom', fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} hide />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
          <ReferenceLine x={dayOfCycle} stroke="var(--primary)" strokeDasharray="4 4" label={{ value: 'Hoje', fontSize: 11, fill: 'var(--primary)' }} />
          <Line type="monotone" dataKey="estrogen" stroke="#E91E8C" strokeWidth={2} dot={false} name="Estrogênio" />
          <Line type="monotone" dataKey="progesterone" stroke="#9C27B0" strokeWidth={2} dot={false} name="Progesterona" />
          <Line type="monotone" dataKey="lh" stroke="#FF9800" strokeWidth={2} dot={false} name="LH (pico)" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {[
          { color: '#E91E8C', label: 'Estrogênio' },
          { color: '#9C27B0', label: 'Progesterona' },
          { color: '#FF9800', label: 'LH' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 3, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>*Valores estimados com base no ciclo médio. Para dados precisos, faça exames laboratoriais.</p>
    </div>
  );
}

export default function Fertility() {
  const { cycleData, data } = useApp();

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
        borderRadius: 28, padding: '24px 20px', color: 'white', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -15, top: -15, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Dashboard de Fertilidade</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
          {cycleData?.isOvulation ? '⭐ Dia da Ovulação!' : cycleData?.isInFertile ? '🌱 Janela Fértil!' : '🌸 Monitoramento'}
        </h1>
        {cycleData && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Próxima ovulação</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {cycleData.daysToOvulation === 0 ? 'HOJE!' : `${cycleData.daysToOvulation} dias`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Janela fértil</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {cycleData.daysToFertile <= 0 ? 'ATIVA!' : `em ${cycleData.daysToFertile} dias`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gauges */}
      {cycleData && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 16, textAlign: 'center' }}>Probabilidade de concepção</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <FertilityGauge
              percent={cycleData.pregnancyPercent}
              label="Hoje"
              color={cycleData.pregnancyChance === 'high' ? '#4CAF50' : cycleData.pregnancyChance === 'medium' ? '#FF9800' : '#9E9E9E'}
            />
          </div>
          <div style={{
            textAlign: 'center', marginTop: 8,
            fontSize: 14, fontWeight: 700,
            color: cycleData.pregnancyChance === 'high' ? '#4CAF50' : cycleData.pregnancyChance === 'medium' ? '#FF9800' : 'var(--text-muted)',
          }}>
            Chance {cycleData.pregnancyChance === 'high' ? 'Alta ✨' : cycleData.pregnancyChance === 'medium' ? 'Média' : 'Baixa'}
          </div>
        </div>
      )}

      {/* Fertility Timeline */}
      {cycleData && <FertilityTimeline cycleData={cycleData} />}

      {/* TTC Stats */}
      <TTCStats data={data} cycleData={cycleData} />

      {/* Hormonal Curve */}
      {cycleData && <HormonalCurve cycleData={cycleData} />}

      {/* Temperature Chart */}
      <TemperatureChart temperatures={data.temperatures} />

      {/* Advice */}
      <FertilityAdvice cycleData={cycleData} />

      {/* Ovulation Signs */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>🔍 Sinais de ovulação para observar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { emoji: '💧', title: 'Muco cervical', desc: 'Torna-se transparente e elástico (como clara de ovo)' },
            { emoji: '🌡️', title: 'Temperatura basal', desc: 'Sobe 0,2-0,5°C após a ovulação' },
            { emoji: '💫', title: 'Dor de Mittelschmerz', desc: 'Dor leve no lado do ovário que ovulou' },
            { emoji: '🔥', title: 'Aumento da libido', desc: 'Instinto natural para maximizar reprodução' },
            { emoji: '🤰', title: 'Sensibilidade mamária', desc: 'Leve sensibilidade nos seios' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
              <span style={{ fontSize: 24 }}>{s.emoji}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
