import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MOODS = [
  { id: 'happy',     emoji: '😊', label: 'Feliz',      color: '#FFB300' },
  { id: 'motivated', emoji: '💪', label: 'Motivada',   color: '#00C896' },
  { id: 'calm',      emoji: '😌', label: 'Calma',      color: '#2196F3' },
  { id: 'sad',       emoji: '😢', label: 'Triste',     color: '#607D8B' },
  { id: 'anxious',   emoji: '😰', label: 'Ansiosa',    color: '#FF7B54' },
  { id: 'angry',     emoji: '😠', label: 'Irritada',   color: '#F44336' },
  { id: 'sensitive', emoji: '🥺', label: 'Sensível',   color: '#E91E63' },
  { id: 'stressed',  emoji: '😤', label: 'Estressada', color: '#9C27B0' },
];

const FLOWS = [
  { id: 'light',     label: 'Leve',        dots: 1, desc: 'Menos de 20ml' },
  { id: 'moderate',  label: 'Moderado',    dots: 2, desc: '20 a 60ml' },
  { id: 'heavy',     label: 'Intenso',     dots: 3, desc: '60 a 80ml' },
  { id: 'very_heavy',label: 'Muito Intenso',dots:4, desc: 'Mais de 80ml' },
  { id: 'none',      label: 'Sem fluxo',   dots: 0, desc: 'Não estou menstruando' },
];

const SYMPTOMS = [
  { id: 'cramps',      emoji: '😣', label: 'Cólicas' },
  { id: 'headache',    emoji: '🤕', label: 'Dor de cabeça' },
  { id: 'bloating',    emoji: '🫄', label: 'Inchaço' },
  { id: 'nausea',      emoji: '🤢', label: 'Náusea' },
  { id: 'breast_pain', emoji: '💔', label: 'Sensib. mamária' },
  { id: 'fatigue',     emoji: '😴', label: 'Fadiga' },
  { id: 'acne',        emoji: '😮', label: 'Acne' },
  { id: 'back_pain',   emoji: '🔙', label: 'Dor lombar' },
];

const STEPS = [
  { title: 'Como está seu humor?',   sub: 'Selecione quantos quiser',              emoji: '😊' },
  { title: 'Fluxo menstrual hoje?',  sub: 'Como está sua menstruação',             emoji: '🩸' },
  { title: 'Sentindo algum sintoma?',sub: 'Marque os que se aplicam',              emoji: '🌡️' },
  { title: 'Saúde & bem-estar',      sub: 'Registros rápidos do seu dia',          emoji: '💚' },
];

export default function DailyPopup() {
  const { showDailyPopup, setShowDailyPopup, logMood, logSymptom, logPeriod, logHealth } = useApp();
  const [step, setStep] = useState(0);
  const [moods, setMoods]   = useState([]);
  const [flow, setFlow]     = useState(null);
  const [syms, setSyms]     = useState([]);
  const [water, setWater]   = useState(0);
  const [sleep, setSleep]   = useState(7);
  const [weight, setWeight] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFmt = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  if (!showDailyPopup) return null;

  const handleSave = () => {
    moods.forEach(m => logMood(today, m));
    if (flow) logPeriod(today, flow);
    syms.forEach(s => logSymptom(today, 'physical', s, true));
    if (water > 0) logHealth(today, 'water', water);
    logHealth(today, 'sleep', sleep);
    if (weight) logHealth(today, 'weight', parseFloat(weight));
    setShowDailyPopup(false);
    setStep(0); setMoods([]); setFlow(null); setSyms([]); setWater(0); setSleep(7); setWeight('');
  };

  const progress = ((step) / (STEPS.length)) * 100;

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowDailyPopup(false); }}>
      <div className="modal">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="animate-float" style={{ fontSize: 52, marginBottom: 10 }}>{STEPS[step].emoji}</div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{STEPS[step].title}</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13, textTransform: 'capitalize' }}>{todayFmt}</p>

          {/* Progress bar */}
          <div style={{ marginTop: 18, background: 'var(--border)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'var(--grad-primary)',
              width: `${progress}%`,
              transition: 'width 0.4s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: 'var(--shadow-pink)',
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontWeight: 600 }}>
            Passo {step + 1} de {STEPS.length}
          </div>
        </div>

        {/* Step 0 — Humor */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {MOODS.map(m => {
              const sel = moods.includes(m.id);
              return (
                <button key={m.id}
                  onClick={() => setMoods(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 6px',
                    border: `2px solid ${sel ? m.color : 'var(--border)'}`,
                    borderRadius: 16,
                    background: sel ? `${m.color}15` : 'transparent',
                    cursor: 'pointer', transition: 'all var(--t-spring)',
                    transform: sel ? 'scale(1.06)' : 'scale(1)',
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: 28 }}>{m.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: sel ? m.color : 'var(--text-3)', textAlign: 'center' }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 1 — Fluxo */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FLOWS.map(f => {
              const sel = flow === f.id;
              return (
                <button key={f.id} onClick={() => setFlow(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    border: `2px solid ${sel ? 'var(--period)' : 'var(--border)'}`,
                    borderRadius: 16, background: sel ? 'var(--period-soft)' : 'transparent',
                    cursor: 'pointer', transition: 'all var(--t)', textAlign: 'left',
                    fontFamily: 'inherit',
                  }}>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < f.dots ? 'var(--period)' : 'var(--border)', transition: 'background var(--t)' }} />
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{f.desc}</div>
                  </div>
                  {sel && <span style={{ color: 'var(--period)', fontSize: 20, fontWeight: 900 }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2 — Sintomas */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {SYMPTOMS.map(s => {
              const sel = syms.includes(s.id);
              return (
                <button key={s.id}
                  onClick={() => setSyms(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 6px',
                    border: `2px solid ${sel ? 'var(--peach)' : 'var(--border)'}`,
                    borderRadius: 16,
                    background: sel ? 'var(--peach-soft)' : 'transparent',
                    cursor: 'pointer', transition: 'all var(--t-spring)',
                    transform: sel ? 'scale(1.06)' : 'scale(1)',
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: 28 }}>{s.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: sel ? 'var(--peach)' : 'var(--text-3)', textAlign: 'center' }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3 — Saúde */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Água */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>💧 Água</span>
                <span style={{ fontWeight: 900, color: '#2196F3', fontSize: 16 }}>{water} copos</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <button key={i} onClick={() => setWater(i + 1)} style={{
                    flex: 1, height: 44, border: 'none', borderRadius: 10,
                    background: i < water ? 'linear-gradient(135deg, #42A5F5, #1976D2)' : 'var(--border)',
                    cursor: 'pointer', transition: 'all var(--t)',
                    fontSize: 16, transform: i < water ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: i < water ? '0 4px 12px rgba(33,150,243,0.35)' : 'none',
                  }}>{i < water ? '💧' : ''}</button>
                ))}
              </div>
            </div>

            {/* Sono */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>😴 Sono</span>
                <span style={{ fontWeight: 900, color: 'var(--purple)', fontSize: 16 }}>{sleep}h</span>
              </div>
              <input type="range" min="3" max="12" step="0.5" value={sleep}
                onChange={e => setSleep(parseFloat(e.target.value))}
                style={{ accentColor: 'var(--purple)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                <span>3h</span><span>7.5h</span><span>12h</span>
              </div>
            </div>

            {/* Peso */}
            <div>
              <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8 }}>⚖️ Peso (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 62.5" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 ? (
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Voltar</button>
          ) : (
            <button className="btn btn-ghost" onClick={() => setShowDailyPopup(false)} style={{ flex: 1 }}>Fechar</button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} style={{ flex: 2 }}>Próximo →</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2 }}>✓ Salvar tudo</button>
          )}
        </div>

      </div>
    </div>
  );
}
