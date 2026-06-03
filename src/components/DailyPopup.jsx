import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Feliz' },
  { id: 'sad', emoji: '😢', label: 'Triste' },
  { id: 'anxious', emoji: '😰', label: 'Ansiosa' },
  { id: 'angry', emoji: '😠', label: 'Irritada' },
  { id: 'sensitive', emoji: '🥺', label: 'Sensível' },
  { id: 'stressed', emoji: '😤', label: 'Estressada' },
  { id: 'motivated', emoji: '💪', label: 'Motivada' },
  { id: 'tired', emoji: '😴', label: 'Cansada' },
];

const FLOWS = [
  { id: 'light', label: 'Leve', icon: '🩸', dots: 1 },
  { id: 'moderate', label: 'Moderado', icon: '🩸', dots: 2 },
  { id: 'heavy', label: 'Intenso', icon: '🩸', dots: 3 },
  { id: 'very_heavy', label: 'Muito Intenso', icon: '🩸', dots: 4 },
  { id: 'none', label: 'Sem fluxo', icon: '🚫', dots: 0 },
];

const QUICK_SYMPTOMS = [
  { id: 'cramps', emoji: '😣', label: 'Cólicas' },
  { id: 'headache', emoji: '🤕', label: 'Dor de cabeça' },
  { id: 'bloating', emoji: '🫄', label: 'Inchaço' },
  { id: 'nausea', emoji: '🤢', label: 'Náusea' },
  { id: 'breast_pain', emoji: '💔', label: 'Sensib. mamária' },
  { id: 'fatigue', emoji: '😴', label: 'Fadiga' },
  { id: 'acne', emoji: '😮', label: 'Acne' },
  { id: 'back_pain', emoji: '🔙', label: 'Dor lombar' },
];

export default function DailyPopup() {
  const { showDailyPopup, setShowDailyPopup, logMood, logSymptom, logPeriod, logHealth, logWater, logSleep } = useApp();
  const [step, setStep] = useState(0);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [weight, setWeight] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "d 'de' MMMM", { locale: ptBR });

  if (!showDailyPopup) return null;

  const handleSave = () => {
    selectedMoods.forEach(mood => logMood(today, mood));
    if (selectedFlow) logPeriod(today, selectedFlow);
    selectedSymptoms.forEach(s => logSymptom(today, 'physical', s, true));
    if (water > 0) logHealth(today, 'water', water);
    if (sleep > 0) logHealth(today, 'sleep', sleep);
    if (weight) logHealth(today, 'weight', parseFloat(weight));
    setShowDailyPopup(false);
  };

  const steps = [
    { title: '😊 Como está seu humor?', subtitle: 'Selecione quantos quiser' },
    { title: '🩸 Tem fluxo hoje?', subtitle: 'Como está sua menstruação' },
    { title: '🌡️ Sintomas físicos', subtitle: 'Selecione os que sentiu hoje' },
    { title: '💧 Saúde e bem-estar', subtitle: 'Registros rápidos de hoje' },
  ];

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowDailyPopup(false); }}>
      <div className="modal" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>🌸</div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Como você está se sentindo hoje?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{todayLabel}</p>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6, height: 6,
                borderRadius: 3,
                background: i <= step ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ minHeight: 200 }}>
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>{steps[0].title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMoods(prev =>
                      prev.includes(mood.id) ? prev.filter(m => m !== mood.id) : [...prev, mood.id]
                    )}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '12px 8px',
                      border: `2px solid ${selectedMoods.includes(mood.id) ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 16,
                      background: selectedMoods.includes(mood.id) ? 'var(--primary-soft)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: selectedMoods.includes(mood.id) ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{mood.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>{steps[1].title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FLOWS.map(flow => (
                  <button
                    key={flow.id}
                    onClick={() => setSelectedFlow(flow.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px',
                      border: `2px solid ${selectedFlow === flow.id ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 16,
                      background: selectedFlow === flow.id ? 'var(--primary-soft)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{flow.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{flow.label}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: i < flow.dots ? 'var(--period)' : 'var(--border)',
                          }} />
                        ))}
                      </div>
                    </div>
                    {selectedFlow === flow.id && <span style={{ color: 'var(--primary)', fontSize: 20 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>{steps[2].title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {QUICK_SYMPTOMS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSymptoms(prev =>
                      prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                    )}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '12px 8px',
                      border: `2px solid ${selectedSymptoms.includes(s.id) ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 16,
                      background: selectedSymptoms.includes(s.id) ? '#fff3ee' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{s.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 4, color: 'var(--text-secondary)' }}>{steps[3].title}</h3>
              
              {/* Water */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>💧 Água bebida</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{water} copos</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button key={i} onClick={() => setWater(i + 1)}
                      style={{
                        flex: 1, height: 36,
                        border: 'none',
                        borderRadius: 8,
                        background: i < water ? '#2196F3' : 'var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: 16,
                      }}>
                      {i < water ? '💧' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>😴 Horas de sono</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{sleep}h</span>
                </div>
                <input type="range" min="3" max="12" step="0.5" value={sleep}
                  onChange={e => setSleep(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>3h</span><span>7.5h</span><span>12h</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>⚖️ Peso hoje (kg)</label>
                <input
                  type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="Ex: 62.5"
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: '2px solid var(--border)', borderRadius: 12,
                    fontSize: 16, background: 'var(--bg)', color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
              Voltar
            </button>
          )}
          {step < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} style={{ flex: 2 }}>
              Próximo →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2 }}>
              Salvar Registros ✓
            </button>
          )}
          {step === 0 && (
            <button className="btn btn-ghost" onClick={() => setShowDailyPopup(false)} style={{ flex: 1 }}>
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
