import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

function AvatarUpload({ name, onSave }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : 'FL';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'var(--gradient-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, fontWeight: 800, color: 'white',
        boxShadow: '0 4px 20px rgba(233,30,140,0.3)',
      }}>{initials}</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{name || 'Meu Perfil'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Modo Tentante Ativo 🤰</div>
      </div>
    </div>
  );
}

function SettingsToggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        style={{
          width: 50, height: 28, borderRadius: 14,
          background: value ? 'var(--primary)' : 'var(--border)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'all 0.25s',
          flexShrink: 0,
        }}>
        <div style={{
          position: 'absolute', top: 3,
          left: value ? 25 : 3,
          width: 22, height: 22, borderRadius: '50%',
          background: 'white',
          transition: 'left 0.25s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

function CycleSettings({ user, updateUser }) {
  const [cycleLength, setCycleLength] = useState(user.cycleLength);
  const [periodLength, setPeriodLength] = useState(user.periodLength);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ cycleLength, periodLength });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Duração do ciclo</label>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{cycleLength} dias</span>
        </div>
        <input type="range" min="21" max="40" value={cycleLength} onChange={e => setCycleLength(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          <span>21 dias</span><span>28 dias</span><span>40 dias</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Duração da menstruação</label>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{periodLength} dias</span>
        </div>
        <input type="range" min="2" max="10" value={periodLength} onChange={e => setPeriodLength(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          <span>2 dias</span><span>5 dias</span><span>10 dias</span>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        {saved ? '✓ Salvo!' : '💾 Salvar configurações'}
      </button>
    </div>
  );
}

function PartnerShare({ data, updateSettings }) {
  const [showQR, setShowQR] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const shareLink = `https://florafem.app/partner/${btoa(JSON.stringify({ name: data.user.name, token: Date.now().toString(36) }))}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendEmail = () => {
    if (!partnerEmail) return;
    const subject = encodeURIComponent(`${data.user.name} te convidou para o FloraFem 🌸`);
    const body = encodeURIComponent(
      `Olá!\n\n${data.user.name} quer compartilhar informações do ciclo com você no FloraFem.\n\nClique no link para aceitar: ${shareLink}\n\nCom o FloraFem Partner, você pode ver:\n• Janela fértil\n• Humor da parceira\n• Próxima menstruação\n• Melhores dias para tentar\n\n💜 FloraFem – Ciclo & Fertilidade`
    );
    window.open(`mailto:${partnerEmail}?subject=${subject}&body=${body}`);
  };

  // Simple QR code using an external API (data URI approach)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}&color=E91E8C&bgcolor=FFF0F5`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        padding: '16px', borderRadius: 16,
        background: 'linear-gradient(135deg, #fff0f5 0%, #f3e5f5 100%)',
        border: '2px solid var(--primary-light)',
      }}>
        <h4 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 6 }}>👫 Parceiro conectado</h4>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Compartilhe sua janela fértil, humor e os melhores dias para tentar com seu parceiro. Ele só verá o que você permitir.
        </p>
      </div>

      {/* Email invite */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          📧 Convidar por e-mail
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)}
            placeholder="email@exemplo.com"
            style={{
              flex: 1, padding: '12px 16px',
              border: '2px solid var(--border)', borderRadius: 12,
              fontSize: 14, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }} />
          <button className="btn btn-primary" onClick={handleSendEmail}>Enviar</button>
        </div>
      </div>

      {/* Link */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          🔗 Link de convite
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={shareLink}
            style={{
              flex: 1, padding: '12px 16px',
              border: '2px solid var(--border)', borderRadius: 12,
              fontSize: 12, background: 'var(--bg)', color: 'var(--text-muted)', outline: 'none',
              fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis',
            }} />
          <button className="btn btn-ghost" onClick={handleCopy}>
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* QR Code */}
      <button className="btn btn-outline" onClick={() => setShowQR(!showQR)}>
        {showQR ? '🙈 Ocultar QR Code' : '📱 Mostrar QR Code'}
      </button>

      {showQR && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px', background: '#fff0f5', borderRadius: 16 }}>
          <img src={qrUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12 }} onError={e => { e.target.style.display = 'none'; }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Peça ao seu parceiro para escanear este código
          </p>
        </div>
      )}

      {/* What partner sees */}
      <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 14 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>👀 O parceiro poderá ver:</h4>
        {[
          '🌱 Janela fértil e ovulação',
          '🩸 Próxima menstruação prevista',
          '😊 Humor do dia (quando compartilhado)',
          '💡 Melhores dias para tentar',
          '🤰 Registros de tentativas conjuntas',
        ].map((item, i) => (
          <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>{item}</div>
        ))}
      </div>

      <SettingsToggle
        label="Compartilhar automaticamente"
        desc="Atualizar dados do parceiro em tempo real"
        value={data.settings.shareWithPartner}
        onChange={v => updateSettings({ shareWithPartner: v })}
      />
    </div>
  );
}

function AIAssistantSection() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'O que é a janela fértil?',
    'Como aumentar as chances de engravidar?',
    'O que é temperatura basal?',
    'Quando fazer teste de gravidez?',
    'O que são coágulos na menstruação?',
    'O que é síndrome do ovário policístico?',
  ];

  const knowledgeBase = {
    'janela fértil': 'A **janela fértil** dura cerca de 6 dias: os 5 dias antes da ovulação e o dia da ovulação. Os espermatozoides vivem até 5 dias dentro do útero, por isso as relações nesses dias aumentam muito as chances de gravidez. 🌱',
    'temperatura basal': 'A **temperatura basal corporal (TBC)** é a temperatura do corpo em repouso total. Após a ovulação, ela sobe 0,2–0,5°C devido à progesterona. Meça todos os dias ao acordar, antes de se levantar, com termômetro específico. 🌡️',
    'engravidar': 'Para aumentar as chances: ✅ Acompanhe a janela fértil • ✅ Tenha relações nos dias férteis (especialmente no dia da ovulação) • ✅ Tome ácido fólico (400mcg/dia) • ✅ Mantenha peso saudável • ✅ Reduza estresse • ✅ Evite álcool e cigarro. 🤰',
    'teste de gravidez': 'O **teste de gravidez** detecta o hormônio hCG. O melhor momento é após o atraso menstrual (1° dia de atraso). Alguns testes ultra-sensíveis detectam até 5 dias antes. Faça com a primeira urina da manhã para maior precisão. 🏥',
    'coágulos': 'Pequenos **coágulos** (menores que 2,5cm) são comuns e normais, especialmente no 2° e 3° dias do fluxo. Coágulos grandes ou frequentes podem indicar mioma, endometriose ou desequilíbrio hormonal. Consulte um ginecologista se persistirem. 🩸',
    'ovário policístico': 'A **SOP (Síndrome dos Ovários Policísticos)** é um distúrbio hormonal que pode causar ciclos irregulares, excesso de androgênios e cistos ovarianos. Afeta 1 em cada 10 mulheres. O diagnóstico é feito com ultrassom + exames de sangue. Tem tratamento! 💊',
    'muco cervical': 'O **muco cervical** muda durante o ciclo: seco → cremoso → aquoso → **transparente e elástico (como clara de ovo)** = período fértil. Observar o muco ajuda a identificar os dias mais férteis. 💧',
    'ovulação': 'A **ovulação** ocorre quando o ovário libera um óvulo, geralmente 14 dias antes da próxima menstruação. O óvulo sobrevive apenas 12–24 horas. Sinais: muco elástico, leve dor no lado do ovário (Mittelschmerz), aumento da libido, temperatura basal sobe. ⭐',
  };

  const getResponse = (q) => {
    const lower = q.toLowerCase();
    for (const [key, val] of Object.entries(knowledgeBase)) {
      if (lower.includes(key)) return val;
    }
    return `Ótima pergunta sobre "${q}"! 💜\n\nPara respostas personalizadas sobre fertilidade, ciclo menstrual e saúde reprodutiva, recomendo consultar seu ginecologista ou obstetra. Eles podem avaliar seu caso específico com exames e histórico completo.\n\nEnquanto isso, continue registrando seus dados no FloraFem para ter um histórico completo para levar à consulta! 🌸`;
  };

  const handleAsk = (q) => {
    const question = q || query;
    if (!question.trim()) return;
    setLoading(true);
    setQuery(question);
    setTimeout(() => {
      setResponse(getResponse(question));
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex', gap: 8, padding: '16px', background: 'linear-gradient(135deg, #fff0f5 0%, #f3e5f5 100%)',
        borderRadius: 16, alignItems: 'flex-start', gap: 12,
      }}>
        <span style={{ fontSize: 32 }}>🤖</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>Assistente FloraFem</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Tire dúvidas sobre fertilidade, ciclo e saúde reprodutiva</div>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Perguntas frequentes
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => handleAsk(s)}
              style={{
                padding: '8px 14px', border: '2px solid var(--border)',
                borderRadius: 99, background: 'var(--bg)', cursor: 'pointer',
                fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Faça sua pergunta..."
          style={{
            flex: 1, padding: '12px 16px',
            border: '2px solid var(--border)', borderRadius: 12,
            fontSize: 14, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }} />
        <button className="btn btn-primary" onClick={() => handleAsk()} disabled={loading} style={{ minWidth: 60 }}>
          {loading ? '⏳' : '✈️'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div style={{
          padding: '16px 18px',
          background: 'var(--primary-soft)',
          borderRadius: 16, borderLeft: '4px solid var(--primary)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>FloraFem IA</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {response}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
            ⚠️ Informações educativas apenas. Consulte sempre seu médico.
          </p>
        </div>
      )}
    </div>
  );
}

const SECTIONS = [
  { id: 'profile', emoji: '👤', label: 'Meu perfil' },
  { id: 'cycle', emoji: '♻️', label: 'Ciclo' },
  { id: 'notifications', emoji: '🔔', label: 'Notificações' },
  { id: 'partner', emoji: '👫', label: 'Compartilhar' },
  { id: 'ai', emoji: '🤖', label: 'Assistente IA' },
  { id: 'about', emoji: 'ℹ️', label: 'Sobre' },
];

export default function Profile() {
  const { data, updateUser, updateSettings, toggleTheme, theme } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState(data.user.name || '');
  const [saved, setSaved] = useState(false);

  const handleSaveName = () => {
    updateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade">
      <AvatarUpload name={data.user.name} />

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              border: `2px solid ${activeSection === s.id ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 99, background: activeSection === s.id ? 'var(--primary-soft)' : 'transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: 13,
              color: activeSection === s.id ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
            <span>{s.emoji}</span><span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="card">
        {activeSection === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>👤 Meu Perfil</h3>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Nome</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 12, fontSize: 16, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
            </div>
            <SettingsToggle
              label="🤰 Modo Tentante"
              desc="Ativa predições avançadas e dicas para engravidar"
              value={data.user.ttcMode}
              onChange={v => updateUser({ ttcMode: v })}
            />
            <SettingsToggle
              label={theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              desc="Alterna entre tema claro e escuro"
              value={theme === 'dark'}
              onChange={toggleTheme}
            />
            <button className="btn btn-primary" onClick={handleSaveName}>
              {saved ? '✓ Salvo!' : '💾 Salvar perfil'}
            </button>
          </div>
        )}

        {activeSection === 'cycle' && (
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>♻️ Configurações do Ciclo</h3>
            <CycleSettings user={data.user} updateUser={updateUser} />
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>🔔 Notificações</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <SettingsToggle label="Lembrete diário de registro" desc="Às 21h se você não registrou nada" value={data.settings.notifications} onChange={v => updateSettings({ notifications: v })} />
              <SettingsToggle label="Alerta de janela fértil" desc="Notificação quando a janela fértil começar" value={true} onChange={() => {}} />
              <SettingsToggle label="Alerta de menstruação" desc="2 dias antes da próxima menstruação prevista" value={true} onChange={() => {}} />
              <SettingsToggle label="Alerta de ovulação" desc="No dia estimado de ovulação" value={true} onChange={() => {}} />
              <SettingsToggle label="Mensagens de apoio" desc="Mensagens motivacionais durante o ciclo" value={false} onChange={() => {}} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                ⏰ Horário do lembrete diário
              </label>
              <input type="time" value={data.settings.reminderTime} onChange={e => updateSettings({ reminderTime: e.target.value })}
                style={{ padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 12, fontSize: 16, background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
            </div>
          </div>
        )}

        {activeSection === 'partner' && (
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>👫 Compartilhar com Parceiro</h3>
            <PartnerShare data={data} updateSettings={updateSettings} />
          </div>
        )}

        {activeSection === 'ai' && (
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>🤖 Assistente de IA</h3>
            <AIAssistantSection />
          </div>
        )}

        {activeSection === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🌸</div>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>FloraFem</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Ciclo & Fertilidade</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Versão 1.0.0</p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                Desenvolvido com 💜 para apoiar mulheres em sua jornada de saúde reprodutiva e maternidade.
              </p>
            </div>
            {[
              { emoji: '🔒', title: 'Privacidade', desc: 'Seus dados ficam 100% no seu dispositivo. Não compartilhamos nada.' },
              { emoji: '🌐', title: 'PWA', desc: 'Instale como app no celular — funciona offline!' },
              { emoji: '💜', title: 'Inspirado em', desc: 'Flo Health, Clue e Premom — os melhores apps de ciclo do mundo.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 24 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}

            {/* Reset */}
            <button
              onClick={() => { if (window.confirm('Tem certeza? Todos os dados serão apagados.')) { localStorage.clear(); window.location.reload(); } }}
              style={{ width: '100%', padding: '12px', border: '2px solid #FF5252', borderRadius: 12, background: 'transparent', color: '#FF5252', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
              🗑️ Apagar todos os dados
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
