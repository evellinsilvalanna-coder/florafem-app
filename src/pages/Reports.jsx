import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function SectionTitle({ emoji, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 14px' }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <h2 style={{ fontSize: 18 }}>{title}</h2>
    </div>
  );
}

function KpiCard({ emoji, label, value, sub, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '18px 12px' }}>
      <div style={{ fontSize: 30, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || 'var(--primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function WeightChart({ weights }) {
  if (weights.length < 2) return (
    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
      Registre seu peso por pelo menos 2 dias para ver o gráfico 📊
    </div>
  );
  const data = weights.slice(-30).map(w => ({
    date: format(new Date(w.date + 'T12:00:00'), 'd/MM'),
    peso: w.weight,
  }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#9C27B0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
          formatter={(v) => [`${v} kg`, 'Peso']} />
        <Area type="monotone" dataKey="peso" stroke="#9C27B0" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#9C27B0', r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SymptomsRadar({ symptoms }) {
  const allDays = Object.keys(symptoms);
  if (allDays.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
      Registre sintomas para ver as tendências 🌡️
    </div>
  );

  const counts = {};
  const labels = {
    cramps: 'Cólicas', headache: 'Cabeça', back_pain: 'Lombar',
    breast_pain: 'Seios', bloating: 'Inchaço', acne: 'Acne',
    nausea: 'Náusea', fatigue: 'Fadiga',
  };
  Object.values(labels).forEach(l => { counts[l] = 0; });
  allDays.forEach(day => {
    const physical = symptoms[day]?.physical || {};
    Object.keys(physical).forEach(s => {
      if (physical[s] && labels[s]) counts[labels[s]] = (counts[labels[s]] || 0) + 1;
    });
  });

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <PolarRadiusAxis tick={false} />
        <Radar name="Ocorrências" dataKey="value" stroke="#E91E8C" fill="#E91E8C" fillOpacity={0.25} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function MoodChart({ moods }) {
  const days = Object.keys(moods);
  if (days.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
      Registre seu humor para ver as tendências 😊
    </div>
  );

  const moodCount = {};
  const moodEmojis = { happy: '😊', sad: '😢', anxious: '😰', angry: '😠', sensitive: '🥺', stressed: '😤', motivated: '💪', down: '😔', calm: '😌', confident: '😎', tired: '😴' };
  days.forEach(day => {
    (moods[day] || []).forEach(m => {
      moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
    });
  });

  const data = Object.entries(moodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([mood, count]) => ({ mood: `${moodEmojis[mood] || '•'} ${mood}`, count }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis type="category" dataKey="mood" tick={{ fontSize: 12, fill: 'var(--text-primary)' }} width={110} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}
          formatter={(v) => [v, 'Ocorrências']} />
        <Bar dataKey="count" fill="#9C27B0" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function WaterSleepChart({ health }) {
  const days = Object.keys(health).sort().slice(-14);
  if (days.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
      Registre água e sono para ver as tendências 💧😴
    </div>
  );
  const data = days.map(day => ({
    date: format(new Date(day + 'T12:00:00'), 'd/MM'),
    agua: health[day]?.water || 0,
    sono: health[day]?.sleep || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="agua" stroke="#2196F3" strokeWidth={2} dot={{ r: 3 }} name="Água (copos)" />
        <Line type="monotone" dataKey="sono" stroke="#9C27B0" strokeWidth={2} dot={{ r: 3 }} name="Sono (horas)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SexActivityChart({ sexActivity }) {
  if (sexActivity.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
      Nenhuma atividade registrada ainda 💕
    </div>
  );

  const byType = { protected: 0, unprotected: 0, ttc: 0, oral: 0 };
  sexActivity.forEach(s => { if (byType[s.type] !== undefined) byType[s.type]++; });

  const data = [
    { name: '🛡️ Protegida', value: byType.protected, color: '#4CAF50' },
    { name: '💏 Sem prot.', value: byType.unprotected, color: '#FF9800' },
    { name: '🤰 Tentando', value: byType.ttc, color: '#E91E8C' },
    { name: '💋 Oral', value: byType.oral, color: '#9C27B0' },
  ].filter(d => d.value > 0);

  const total = sexActivity.length;
  const withEjaculation = sexActivity.filter(s => s.ejaculation).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        {data.map((d, i) => (
          <div key={i} style={{
            flex: '1 1 100px', textAlign: 'center',
            padding: '12px 8px', background: 'var(--bg-secondary)', borderRadius: 14,
          }}>
            <div style={{ fontSize: 20 }}>{d.name.split(' ')[0]}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: d.color }}>{d.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.name.replace(/\S+ /, '')}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--primary-soft)', borderRadius: 14 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{total}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#E91E8C' }}>{withEjaculation}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Com ejaculação</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#4CAF50' }}>
            {total > 0 ? Math.round((sexActivity.filter(s => s.type === 'ttc').length / total) * 100) : 0}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tentativas TTC</div>
        </div>
      </div>
    </div>
  );
}

function ExportButton({ data }) {
  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: data.user,
      periods: data.periods,
      sexActivity: data.sexActivity,
      weights: data.weights,
      temperatures: data.temperatures,
      symptoms: data.symptoms,
      moods: data.moods,
      health: data.health,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `florafem_dados_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSV = () => {
    const rows = [['Data', 'Fluxo', 'Humor', 'Sintomas', 'Peso', 'Água', 'Sono', 'Temp. Basal']];
    const allDates = new Set([
      ...data.periods.map(p => p.date),
      ...Object.keys(data.symptoms),
      ...Object.keys(data.moods),
      ...Object.keys(data.health),
      ...data.weights.map(w => w.date),
      ...data.temperatures.map(t => t.date),
    ]);
    [...allDates].sort().forEach(date => {
      const period = data.periods.find(p => p.date === date);
      const moods = (data.moods[date] || []).map(m => m.mood).join('|');
      const syms = Object.values(data.symptoms[date]?.physical || {}).filter(Boolean);
      const health = data.health[date] || {};
      const weight = data.weights.find(w => w.date === date);
      const temp = data.temperatures.find(t => t.date === date);
      rows.push([date, period?.flow || '', moods, syms.join('|'), weight?.weight || '', health.water || '', health.sleep || '', temp?.temp || '']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `florafem_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn btn-outline" onClick={handleCSV} style={{ flex: 1 }}>
        📊 Exportar CSV
      </button>
      <button className="btn btn-ghost" onClick={handleExport} style={{ flex: 1 }}>
        💾 Exportar JSON
      </button>
    </div>
  );
}

export default function Reports() {
  const { data, cycleData, getStats } = useApp();
  const stats = getStats();

  const totalPeriodDays = data.periods.filter(p => p.flow && p.flow !== 'none').length;
  const totalSexDays = data.sexActivity.length;
  const avgWeight = data.weights.length > 0
    ? (data.weights.reduce((a, b) => a + b.weight, 0) / data.weights.length).toFixed(1)
    : '—';

  const totalWater = Object.values(data.waterLog || {}).reduce((a, b) => a + b, 0);
  const daysWithWater = Object.keys(data.waterLog || {}).length;
  const avgWater = daysWithWater > 0 ? (totalWater / daysWithWater).toFixed(1) : '—';

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade">
      {/* Header */}
      <div style={{
        background: 'var(--gradient-primary)',
        borderRadius: 28, padding: '24px 20px', color: 'white', marginBottom: 8,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>📊 Relatórios</h1>
        <p style={{ opacity: 0.85, fontSize: 14 }}>Análise completa do seu ciclo e saúde</p>
      </div>

      {/* KPIs */}
      <SectionTitle emoji="📌" title="Visão geral" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 8 }}>
        <KpiCard emoji="♻️" label="Duração do ciclo" value={`${data.user.cycleLength}d`} sub="média atual" color="var(--primary)" />
        <KpiCard emoji="🩸" label="Dias registrados" value={totalPeriodDays} sub="de menstruação" color="#E91E8C" />
        <KpiCard emoji="💕" label="Atividades sexuais" value={totalSexDays} sub="no total" color="#9C27B0" />
        <KpiCard emoji="⚖️" label="Peso médio" value={avgWeight !== '—' ? `${avgWeight}kg` : '—'} sub="últimos registros" color="#FF9800" />
        <KpiCard emoji="💧" label="Média de água" value={avgWater !== '—' ? `${avgWater}cp` : '—'} sub="copos/dia" color="#2196F3" />
        <KpiCard emoji="📅" label="Regularidade" value="85%" sub="do ciclo" color="#4CAF50" />
      </div>

      {/* Weight */}
      <SectionTitle emoji="⚖️" title="Evolução do peso" />
      <div className="card" style={{ marginBottom: 8 }}>
        <WeightChart weights={data.weights} />
      </div>

      {/* Symptoms */}
      <SectionTitle emoji="🌡️" title="Sintomas mais frequentes" />
      <div className="card" style={{ marginBottom: 8 }}>
        <SymptomsRadar symptoms={data.symptoms} />
      </div>

      {/* Mood */}
      <SectionTitle emoji="😊" title="Humores registrados" />
      <div className="card" style={{ marginBottom: 8 }}>
        <MoodChart moods={data.moods} />
      </div>

      {/* Water & Sleep */}
      <SectionTitle emoji="💧" title="Água e sono (últimos 14 dias)" />
      <div className="card" style={{ marginBottom: 8 }}>
        <WaterSleepChart health={data.health} />
      </div>

      {/* Sex Activity */}
      <SectionTitle emoji="💕" title="Atividade sexual" />
      <div className="card" style={{ marginBottom: 8 }}>
        <SexActivityChart sexActivity={data.sexActivity} />
      </div>

      {/* Fertility Summary */}
      {cycleData && (
        <>
          <SectionTitle emoji="🌸" title="Resumo de fertilidade" />
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Dia atual do ciclo', value: `Dia ${cycleData.dayOfCycle} de ${cycleData.cycleLength}` },
                { label: 'Próxima ovulação', value: format(cycleData.ovulationDay, "d 'de' MMMM", { locale: ptBR }) },
                { label: 'Janela fértil', value: `${format(cycleData.fertileStart, "d", { locale: ptBR })} – ${format(cycleData.fertileEnd, "d 'de' MMMM", { locale: ptBR })}` },
                { label: 'Próxima menstruação', value: format(cycleData.nextPeriod, "d 'de' MMMM", { locale: ptBR }) },
                { label: 'Chance de gravidez hoje', value: `${cycleData.pregnancyPercent}% (${cycleData.pregnancyChance === 'high' ? 'Alta' : cycleData.pregnancyChance === 'medium' ? 'Média' : 'Baixa'})` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Export */}
      <SectionTitle emoji="📤" title="Exportar dados" />
      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Exporte seus dados para compartilhar com seu médico ou fazer backup.
        </p>
        <ExportButton data={data} />
      </div>
    </div>
  );
}
