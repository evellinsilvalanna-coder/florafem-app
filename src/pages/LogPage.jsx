import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TABS = [
  { id: 'period', emoji: '🩸', label: 'Menstruação' },
  { id: 'symptoms', emoji: '🌡️', label: 'Sintomas' },
  { id: 'mood', emoji: '😊', label: 'Humor' },
  { id: 'sex', emoji: '💕', label: 'Sexual' },
  { id: 'health', emoji: '💚', label: 'Saúde' },
];

const PHYSICAL_SYMPTOMS = [
  { id: 'cramps', emoji: '😣', label: 'Cólicas' },
  { id: 'headache', emoji: '🤕', label: 'Dor de cabeça' },
  { id: 'back_pain', emoji: '🔙', label: 'Dor lombar' },
  { id: 'breast_pain', emoji: '💔', label: 'Sensib. mamária' },
  { id: 'bloating', emoji: '🫄', label: 'Inchaço' },
  { id: 'acne', emoji: '😮', label: 'Acne' },
  { id: 'nausea', emoji: '🤢', label: 'Náusea' },
  { id: 'fatigue', emoji: '😴', label: 'Fadiga' },
  { id: 'discharge', emoji: '💧', label: 'Corrimento' },
  { id: 'sleep_changes', emoji: '😵', label: 'Alt. do sono' },
  { id: 'hot_flashes', emoji: '🔥', label: 'Ondas de calor' },
  { id: 'dizziness', emoji: '😵‍💫', label: 'Tontura' },
];

const EMOTIONAL_SYMPTOMS = [
  { id: 'happy', emoji: '😊', label: 'Feliz' },
  { id: 'sad', emoji: '😢', label: 'Triste' },
  { id: 'anxious', emoji: '😰', label: 'Ansiosa' },
  { id: 'angry', emoji: '😠', label: 'Irritada' },
  { id: 'sensitive', emoji: '🥺', label: 'Sensível' },
  { id: 'stressed', emoji: '😤', label: 'Estressada' },
  { id: 'motivated', emoji: '💪', label: 'Motivada' },
  { id: 'down', emoji: '😔', label: 'Desanimada' },
  { id: 'calm', emoji: '😌', label: 'Calma' },
  { id: 'confident', emoji: '😎', label: 'Confiante' },
];

const SEXUAL_SYMPTOMS = [
  { id: 'high_libido', emoji: '🔥', label: 'Aum. da libido' },
  { id: 'low_libido', emoji: '❄️', label: 'Dim. da libido' },
];

const FLOW_OPTIONS = [
  { id: 'light', label: 'Leve', dots: 1, desc: '< 20ml' },
  { id: 'moderate', label: 'Moderado', dots: 2, desc: '20-60ml' },
  { id: 'heavy', label: 'Intenso', dots: 3, desc: '60-80ml' },
  { id: 'very_heavy', label: 'Muito Intenso', dots: 4, desc: '> 80ml' },
];

const COLORS = [
  { id: 'pink', label: 'Rosa', hex: '#FF69B4' },
  { id: 'red', label: 'Vermelho', hex: '#DC143C' },
  { id: 'dark_red', label: 'Verm. escuro', hex: '#8B0000' },
  { id: 'brown', label: 'Marrom', hex: '#8B4513' },
  { id: 'black', label: 'Preto', hex: '#1a1a1a' },
  { id: 'orange', label: 'Laranja', hex: '#FF8C00' },
];

const SEX_TYPES = [
  { id: 'protected', emoji: '🛡️', label: 'Protegida', desc: 'Com método contraceptivo' },
  { id: 'unprotected', emoji: '💏', label: 'Sem proteção', desc: 'Sem método contraceptivo' },
  { id: 'ttc', emoji: '🤰', label: 'Tentando engravidar', desc: 'Com intenção de conceber' },
  { id: 'oral', emoji: '💋', label: 'Sexo oral', desc: '' },
];

function ChipSelector({ options, selected, onToggle, multi = true, color = 'var(--primary)' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {options.map(opt => {
        const isSelected = multi ? (Array.isArray(selected) && selected.includes(opt.id)) : selected === opt.id;
        return (
          <button key={opt.id} onClick={() => onToggle(opt.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 8px',
              border: `2px solid ${isSelected ? color : 'var(--border)'}`,
              borderRadius: 16,
              background: isSelected ? `${color}15` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: isSelected ? 'scale(1.04)' : 'scale(1)',
              fontFamily: 'Inter, sans-serif',
            }}>
            <span style={{ fontSize: 28 }}>{opt.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? color : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PeriodTab({ dateStr }) {
  const { data, logPeriod } = useApp();
  const existing = data.periods.find(p => p.date === dateStr) || {};
  const [flow, setFlow] = useState(existing.flow || null);
  const [color, setColor] = useState(existing.color || null);
  const [clots, setClots] = useState(existing.clots || false);
  const [note, setNote] = useState(existing.note || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (flow) {
      logPeriod(dateStr, flow, color, clots, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Intensidade do fluxo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FLOW_OPTIONS.map(f => (
            <button key={f.id} onClick={() => setFlow(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                border: `2px solid ${flow === f.id ? 'var(--period)' : 'var(--border)'}`,
                borderRadius: 16, background: flow === f.id ? '#fff0f5' : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontFamily: 'Inter, sans-serif',
              }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < f.dots ? '#E91E8C' : 'var(--border)' }} />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
              {flow === f.id && <span style={{ color: 'var(--period)', fontSize: 18, fontWeight: 800 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Cor do fluxo</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c.id} onClick={() => setColor(c.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 14px',
                border: `3px solid ${color === c.id ? c.hex : 'var(--border)'}`,
                borderRadius: 14, background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.hex }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <button onClick={() => setClots(!clots)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '14px 18px', border: `2px solid ${clots ? 'var(--period)' : 'var(--border)'}`,
            borderRadius: 16, background: clots ? '#fff0f5' : 'transparent',
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
          }}>
          <span style={{ fontSize: 22 }}>🫀</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700 }}>Presença de coágulos</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Coágulos visíveis no fluxo</div>
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: clots ? 'var(--period)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700,
          }}>{clots ? '✓' : ''}</div>
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Observações</h3>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Adicione observações sobre sua menstruação..."
          rows={3}
          style={{
            width: '100%', padding: '12px 16px',
            border: '2px solid var(--border)', borderRadius: 14,
            fontSize: 14, background: 'var(--bg)', color: 'var(--text-primary)',
            resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
          }} />
      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%' }}>
        {saved ? '✓ Salvo!' : '💾 Salvar registro'}
      </button>
    </div>
  );
}

function SymptomsTab({ dateStr }) {
  const { data, logSymptom } = useApp();
  const existing = data.symptoms[dateStr] || {};
  const physical = existing.physical || {};
  const sexual = existing.sexual || {};
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('physical');

  const togglePhysical = (id) => {
    logSymptom(dateStr, 'physical', id, !physical[id]);
  };

  const toggleSexual = (id) => {
    logSymptom(dateStr, 'sexual', id, !sexual[id]);
  };

  const sections = [
    { id: 'physical', label: '🩺 Físicos', symptoms: PHYSICAL_SYMPTOMS, toggle: togglePhysical, selected: Object.keys(physical).filter(k => physical[k]) },
    { id: 'sexual', label: '💕 Sexuais', symptoms: SEXUAL_SYMPTOMS, toggle: toggleSexual, selected: Object.keys(sexual).filter(k => sexual[k]) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{
              flex: 1, padding: '10px 16px', border: '2px solid',
              borderColor: activeSection === s.id ? 'var(--primary)' : 'var(--border)',
              borderRadius: 12, background: activeSection === s.id ? 'var(--primary-soft)' : 'transparent',
              cursor: 'pointer', fontWeight: 700, fontSize: 14, color: activeSection === s.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif',
            }}>{s.label}</button>
        ))}
      </div>

      {sections.filter(s => s.id === activeSection).map(section => (
        <div key={section.id}>
          <ChipSelector
            options={section.symptoms}
            selected={section.selected}
            onToggle={section.toggle}
            color="var(--accent)"
          />
        </div>
      ))}
    </div>
  );
}

function MoodTab({ dateStr }) {
  const { data, logMood } = useApp();
  const existingMoods = (data.moods[dateStr] || []).map(m => m.mood);
  const [saved, setSaved] = useState(false);

  const toggleMood = (id) => {
    logMood(dateStr, id);
  };

  const allMoods = [...EMOTIONAL_SYMPTOMS];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Selecione todos os humores que você sentiu hoje. Quanto mais detalhes, melhor a análise! 💜</p>
      <ChipSelector
        options={allMoods}
        selected={existingMoods}
        onToggle={toggleMood}
        color="#9C27B0"
      />
      {existingMoods.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--primary-soft)', borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
            Humores registrados: {existingMoods.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

function SexTab({ dateStr }) {
  const { data, logSex } = useApp();
  const [type, setType] = useState(null);
  const [ejaculation, setEjaculation] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const existing = data.sexActivity.filter(s => s.date === dateStr);

  const handleSave = () => {
    if (!type) return;
    logSex(dateStr, type, ejaculation, note);
    setSaved(true);
    setType(null);
    setEjaculation(false);
    setNote('');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {existing.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--primary-soft)', borderRadius: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>✓ {existing.length} registro(s) hoje</p>
          {existing.map((s, i) => (
            <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {s.type === 'ttc' ? '🤰 Tentativa para engravidar' : s.type === 'protected' ? '🛡️ Protegida' : s.type === 'unprotected' ? '💏 Sem proteção' : '💋 Sexo oral'}
              {s.ejaculation ? ' • ejaculação interna' : ''}
            </p>
          ))}
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Tipo de atividade</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SEX_TYPES.map(s => (
            <button key={s.id} onClick={() => setType(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                border: `2px solid ${type === s.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 16, background: type === s.id ? 'var(--primary-soft)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontFamily: 'Inter, sans-serif',
              }}>
              <span style={{ fontSize: 28 }}>{s.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.label}</div>
                {s.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>}
              </div>
              {type === s.id && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {(type === 'ttc' || type === 'unprotected') && (
        <button onClick={() => setEjaculation(!ejaculation)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '14px 18px', border: `2px solid ${ejaculation ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 16, background: ejaculation ? 'var(--primary-soft)' : 'transparent',
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
          }}>
          <span style={{ fontSize: 22 }}>💧</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700 }}>Ejaculação interna</div>
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: ejaculation ? 'var(--primary)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700,
          }}>{ejaculation ? '✓' : ''}</div>
        </button>
      )}

      <div>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Observações..."
          rows={2}
          style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 14, fontSize: 14, background: 'var(--bg)', color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%' }}>
        {saved ? '✓ Salvo!' : '💾 Adicionar registro'}
      </button>
    </div>
  );
}

function HealthTab({ dateStr }) {
  const { data, logHealth, logWeight, logTemperature } = useApp();
  const existing = data.health[dateStr] || {};
  const [water, setWater] = useState(existing.water || 0);
  const [sleep, setSleep] = useState(existing.sleep || 7);
  const [sleepQuality, setSleepQuality] = useState(existing.sleepQuality || 3);
  const [weight, setWeight] = useState(() => { const w = data.weights.find(x => x.date === dateStr); return w ? w.weight : ''; });
  const [temp, setTemp] = useState(() => { const t = data.temperatures.find(x => x.date === dateStr); return t ? t.temp : ''; });
  const [systolic, setSystolic] = useState(existing.bp_systolic || '');
  const [diastolic, setDiastolic] = useState(existing.bp_diastolic || '');
  const [exercise, setExercise] = useState(existing.exercise || 0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    logHealth(dateStr, 'water', water);
    logHealth(dateStr, 'sleep', sleep);
    logHealth(dateStr, 'sleepQuality', sleepQuality);
    logHealth(dateStr, 'exercise', exercise);
    if (weight) { logWeight(dateStr, parseFloat(weight)); logHealth(dateStr, 'weight', parseFloat(weight)); }
    if (temp) { logTemperature(dateStr, parseFloat(temp)); logHealth(dateStr, 'temp', parseFloat(temp)); }
    if (systolic) { logHealth(dateStr, 'bp_systolic', parseInt(systolic)); logHealth(dateStr, 'bp_diastolic', parseInt(diastolic)); }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '2px solid var(--border)', borderRadius: 14,
    fontSize: 15, background: 'var(--bg)', color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'Inter, sans-serif',
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
    display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Water */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={labelStyle}>💧 Água bebida</label>
          <span style={{ fontWeight: 800, color: '#2196F3', fontSize: 18 }}>{water} copos</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <button key={i} onClick={() => setWater(i + 1)}
              style={{
                flex: 1, height: 48, border: 'none', borderRadius: 10,
                background: i < water ? '#2196F3' : 'var(--border)',
                cursor: 'pointer', transition: 'all 0.2s', fontSize: 18,
              }}>
              {i < water ? '💧' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={labelStyle}>😴 Horas de sono</label>
          <span style={{ fontWeight: 800, color: '#9C27B0', fontSize: 18 }}>{sleep}h</span>
        </div>
        <input type="range" min="3" max="12" step="0.5" value={sleep} onChange={e => setSleep(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#9C27B0' }} />
        <div>
          <label style={{ ...labelStyle, marginTop: 12 }}>Qualidade do sono</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 1, l: '😫 Péssima' }, { v: 2, l: '😕 Ruim' }, { v: 3, l: '😐 Ok' }, { v: 4, l: '😊 Boa' }, { v: 5, l: '😄 Ótima' }].map(q => (
              <button key={q.v} onClick={() => setSleepQuality(q.v)}
                style={{
                  flex: 1, padding: '8px 4px', border: `2px solid ${sleepQuality === q.v ? '#9C27B0' : 'var(--border)'}`,
                  borderRadius: 10, background: sleepQuality === q.v ? '#f3e5f5' : 'transparent',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                  fontFamily: 'Inter, sans-serif',
                }}>{q.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={labelStyle}>🏃 Exercício (min)</label>
          <span style={{ fontWeight: 800, color: '#4CAF50', fontSize: 18 }}>{exercise}min</span>
        </div>
        <input type="range" min="0" max="120" step="5" value={exercise} onChange={e => setExercise(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#4CAF50' }} />
      </div>

      {/* Weight */}
      <div>
        <label style={labelStyle}>⚖️ Peso (kg)</label>
        <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
          placeholder="Ex: 62.5" style={inputStyle} />
      </div>

      {/* Temperature */}
      <div>
        <label style={labelStyle}>🌡️ Temperatura basal (°C)</label>
        <input type="number" step="0.01" value={temp} onChange={e => setTemp(e.target.value)}
          placeholder="Ex: 36.50" style={inputStyle} />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Meça logo ao acordar, antes de se levantar</p>
      </div>

      {/* Blood Pressure */}
      <div>
        <label style={labelStyle}>💊 Pressão arterial (mmHg)</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="number" value={systolic} onChange={e => setSystolic(e.target.value)}
            placeholder="Sistólica" style={{ ...inputStyle, flex: 1 }} />
          <input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)}
            placeholder="Diastólica" style={{ ...inputStyle, flex: 1 }} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%' }}>
        {saved ? '✓ Salvo com sucesso!' : '💾 Salvar dados de saúde'}
      </button>
    </div>
  );
}

export default function LogPage() {
  const [activeLogTab, setActiveLogTab] = useState('period');
  const { selectedDate, setSelectedDate } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  const dateStr = selectedDate || today;

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade">
      {/* Date Selector */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registrando para</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>
            {dateStr === today ? 'Hoje' : format(new Date(dateStr + 'T12:00:00'), "d 'de' MMMM", { locale: ptBR })}
          </div>
        </div>
        <input type="date" value={dateStr} onChange={e => setSelectedDate(e.target.value)}
          style={{
            padding: '8px 14px', border: '2px solid var(--border)', borderRadius: 12,
            fontSize: 14, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          }} />
      </div>

      {/* Tab Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveLogTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              border: `2px solid ${activeLogTab === tab.id ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 99, background: activeLogTab === tab.id ? 'var(--primary-soft)' : 'transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: 13, color: activeLogTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card">
        {activeLogTab === 'period' && <PeriodTab dateStr={dateStr} />}
        {activeLogTab === 'symptoms' && <SymptomsTab dateStr={dateStr} />}
        {activeLogTab === 'mood' && <MoodTab dateStr={dateStr} />}
        {activeLogTab === 'sex' && <SexTab dateStr={dateStr} />}
        {activeLogTab === 'health' && <HealthTab dateStr={dateStr} />}
      </div>
    </div>
  );
}
