import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export default function AppearancePage() {
  const { mode, setMode } = useTheme();

  return (
    <div className="page">
      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <span>Home</span> / <span style={{ color: 'var(--text)' }}>Appearance</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Appearance</h1>
          <p className="page-subtitle">Customize how NeoBuilder ERP looks on your device</p>
        </div>
      </div>

      <div className="table-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: 16 }}>Theme</h3>
        <div className="theme-options">
          {OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={`theme-option ${mode === value ? 'active' : ''}`}
              onClick={() => setMode(value)}
            >
              <Icon size={22} />
              <span>{label}</span>
              {mode === value && <Check size={16} className="theme-option-check" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
