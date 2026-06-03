import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const dayColors = {
  period: { bg: '#E91E8C', text: 'white', border: 'transparent' },
  'period-predicted': { bg: 'transparent', text: '#E91E8C', border: '#E91E8C', borderStyle: 'dashed' },
  ovulation: { bg: '#FF9800', text: 'white', border: 'transparent' },
  fertile: { bg: '#4CAF50', text: 'white', border: 'transparent' },
  normal: { bg: 'transparent', text: 'var(--text-primary)', border: 'transparent' },
};

export default function Calendar() {
  const { getDayStatus, data, cycleData, selectedDate, setSelectedDate } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = (monthStart.getDay() + 6) % 7; // Monday start
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const getDayInfo = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = getDayStatus(dateStr);
    const hasSex = data.sexActivity.some(s => s.date === dateStr);
    const hasSymptoms = data.symptoms[dateStr] && Object.keys(data.symptoms[dateStr]).length > 0;
    const hasMood = data.moods[dateStr] && data.moods[dateStr].length > 0;
    return { dateStr, status, hasSex, hasSymptoms, hasMood };
  };

  const selectedInfo = selectedDate ? {
    sexActivities: data.sexActivity.filter(s => s.date === selectedDate),
    symptoms: data.symptoms[selectedDate] || {},
    moods: data.moods[selectedDate] || [],
    period: data.periods.find(p => p.date === selectedDate),
    note: data.notes[selectedDate],
    health: data.health[selectedDate] || {},
  } : null;

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade">
      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ‹
        </button>
        <h2 style={{ fontSize: 20, textTransform: 'capitalize' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ›
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 16 }}>
        {[
          { color: '#E91E8C', label: 'Menstruação' },
          { color: '#4CAF50', label: 'Fértil' },
          { color: '#FF9800', label: 'Ovulação' },
          { color: '#E91E8C', label: 'Prev.', dashed: true },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: l.dashed ? 'transparent' : l.color,
              border: l.dashed ? `2px dashed ${l.color}` : 'none',
            }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: 16 }}>
        {/* Week Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {weekDays.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const { dateStr, status, hasSex, hasSymptoms, hasMood } = getDayInfo(day);
            const colors = dayColors[status] || dayColors.normal;
            const isSelected = selectedDate === dateStr;
            const today = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                style={{
                  position: 'relative',
                  width: '100%', aspectRatio: '1',
                  border: isSelected ? '2px solid var(--primary)' : `2px ${colors.borderStyle || 'solid'} ${colors.border}`,
                  borderRadius: 12,
                  background: isSelected ? 'var(--primary)' : colors.bg,
                  color: isSelected ? 'white' : colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  fontWeight: today ? 800 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: today ? '0 0 0 2px var(--primary-light)' : 'none',
                }}
              >
                {day.getDate()}
                {/* Dots for events */}
                <div style={{ display: 'flex', gap: 2 }}>
                  {hasSex && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : '#E91E8C' }} />}
                  {hasSymptoms && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : '#FF9800' }} />}
                  {hasMood && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : '#9C27B0' }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && selectedInfo && (
        <div className="card animate-fade" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>
            📋 {format(parseISO(selectedDate), "d 'de' MMMM", { locale: ptBR })}
          </h3>

          {selectedInfo.period && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff0f5', borderRadius: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🩸</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--period)' }}>Menstruação</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fluxo: {selectedInfo.period.flow}</div>
              </div>
            </div>
          )}

          {selectedInfo.sexActivities.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff0f5', borderRadius: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>💕</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Atividade Sexual</div>
                {selectedInfo.sexActivities.map((s, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {s.type === 'ttc' ? 'Tentativa para engravidar' : s.type === 'protected' ? 'Protegida' : 'Sem proteção'}
                    {s.ejaculation ? ' • Ejaculação interna' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedInfo.moods.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f3e5f5', borderRadius: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>😊</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9C27B0' }}>Humor</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedInfo.moods.map(m => m.mood).join(', ')}</div>
              </div>
            </div>
          )}

          {Object.keys(selectedInfo.symptoms).length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff8f0', borderRadius: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🌡️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Sintomas</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {Object.values(selectedInfo.symptoms).flatMap(s => Object.keys(s).filter(k => s[k])).join(', ')}
                </div>
              </div>
            </div>
          )}

          {Object.keys(selectedInfo.health).length > 0 && (
            <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>💚 Saúde</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {selectedInfo.health.water && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>💧 {selectedInfo.health.water} copos</span>}
                {selectedInfo.health.sleep && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>😴 {selectedInfo.health.sleep}h de sono</span>}
                {selectedInfo.health.weight && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⚖️ {selectedInfo.health.weight}kg</span>}
              </div>
            </div>
          )}

          {!selectedInfo.period && !selectedInfo.sexActivities.length && !selectedInfo.moods.length && !Object.keys(selectedInfo.symptoms).length && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Nenhum registro para este dia.
            </p>
          )}
        </div>
      )}

      {/* Cycle Summary */}
      {cycleData && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>📊 Resumo do Ciclo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: 'Duração do ciclo', value: `${cycleData.cycleLength} dias` },
              { label: 'Duração da menstruação', value: `${cycleData.periodLength} dias` },
              { label: 'Dia atual', value: `Dia ${cycleData.dayOfCycle}` },
              { label: 'Ovulação', value: format(cycleData.ovulationDay, "d/MM", { locale: ptBR }) },
            ].map((item, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
