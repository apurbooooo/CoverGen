import { presetThemeColors } from '../data/templateOptions.js';
import { Check } from 'lucide-react';

/**
 * Theme color selector with preset swatches and a native color picker for custom colors.
 */
export default function ThemeSelector({ themeColor, onChange }) {
  const isCustom = !presetThemeColors.find((c) => c.value === themeColor);

  return (
    <div>
      {/* Preset swatches */}
      <div className="color-presets" role="group" aria-label="Theme color presets">
        {presetThemeColors.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`color-preset-btn ${themeColor === preset.value ? 'active' : ''}`}
            style={{ background: preset.value }}
            onClick={() => onChange(preset.value)}
            aria-label={`${preset.label} color`}
            aria-pressed={themeColor === preset.value}
            title={preset.label}
          >
            {themeColor === preset.value && (
              <Check size={12} color="white" strokeWidth={3} aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* Custom color picker */}
      <div className="color-input-row" style={{ marginTop: '0.875rem' }}>
        <input
          type="color"
          value={themeColor}
          onChange={(e) => onChange(e.target.value)}
          className="color-picker-native"
          id="theme-color-custom"
          aria-label="Custom theme color"
          title="Pick a custom color"
        />
        <div>
          <label htmlFor="theme-color-custom" style={{ margin: 0, marginBottom: '0.125rem', cursor: 'pointer' }}>
            Custom Color
          </label>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {themeColor.toUpperCase()}
            {isCustom && (
              <span className="badge badge-blue" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Custom</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
