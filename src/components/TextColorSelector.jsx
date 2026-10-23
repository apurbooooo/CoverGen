import { Check } from 'lucide-react';

const presetTextColors = [
  { value: '#1A202C', label: 'Charcoal' },
  { value: '#334155', label: 'Slate' },
  { value: '#1E3A5F', label: 'Navy' },
  { value: '#3F3A32', label: 'Warm gray' },
  { value: '#1F513B', label: 'Forest' },
];

export default function TextColorSelector({ textColor, onChange }) {
  const normalizedColor = (textColor || '#1A202C').toUpperCase();
  const isPreset = presetTextColors.some((color) => color.value.toUpperCase() === normalizedColor);

  return (
    <div>
      <div className="color-presets" role="group" aria-label="Document text color presets">
        {presetTextColors.map((preset) => {
          const isSelected = preset.value.toUpperCase() === normalizedColor;
          return (
            <button
              key={preset.value}
              type="button"
              className={`color-preset-btn ${isSelected ? 'active' : ''}`}
              style={{ background: preset.value }}
              onClick={() => onChange(preset.value)}
              aria-label={`${preset.label} text color`}
              aria-pressed={isSelected}
              title={preset.label}
            >
              {isSelected && <Check size={12} color="white" strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="color-input-row" style={{ marginTop: '0.875rem' }}>
        <input
          type="color"
          value={normalizedColor}
          onChange={(event) => onChange(event.target.value)}
          className="color-picker-native"
          id="document-text-color"
          aria-label="Custom document text color"
          title="Pick a custom text color"
        />
        <div>
          <label htmlFor="document-text-color" style={{ margin: 0, marginBottom: '0.125rem', cursor: 'pointer' }}>
            Custom text color
          </label>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {normalizedColor}
            {!isPreset && (
              <span className="badge badge-blue" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Custom</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
