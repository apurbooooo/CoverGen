import { useRef } from 'react';
import { Check } from 'lucide-react';
import { templateOptions } from '../data/templateOptions.js';

/**
 * Mini SVG thumbnail renderers for each template — shown in the selector grid.
 */
function ClassicThumb({ color }) {
  return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="100" height="141" fill="white"/>
      <circle cx="50" cy="22" r="10" fill={color} opacity="0.15"/>
      <rect x="20" y="38" width="60" height="4" rx="2" fill={color}/>
      <rect x="30" y="44" width="40" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="10" y="52" width="80" height="1" fill={color} opacity="0.4"/>
      <rect x="25" y="58" width="50" height="3" rx="1" fill={color} opacity="0.5"/>
      <rect x="15" y="65" width="70" height="5" rx="2" fill="#1A202C"/>
      <rect x="25" y="74" width="50" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="10" y="82" width="80" height="1" fill={color} opacity="0.4"/>
      <rect x="10" y="90" width="36" height="2" rx="1" fill={color}/>
      <rect x="10" y="95" width="30" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="10" y="99" width="24" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="54" y="90" width="36" height="2" rx="1" fill={color}/>
      <rect x="54" y="95" width="30" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="54" y="99" width="24" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="10" y="110" width="80" height="1" fill={color} opacity="0.4"/>
      <rect x="20" y="115" width="60" height="2" rx="1" fill="#CBD5E0"/>
    </svg>
  );
}

function ModernThumb({ color }) {
  return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="100" height="141" fill="white"/>
      <rect x="0" y="0" width="6" height="141" fill={color}/>
      <circle cx="25" cy="22" r="8" fill={color} opacity="0.15"/>
      <rect x="15" y="36" width="50" height="3" rx="1" fill={color}/>
      <rect x="15" y="42" width="35" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="15" y="50" width="80" height="1" fill={color} opacity="0.3"/>
      <rect x="15" y="57" width="40" height="2" rx="1" fill={color} opacity="0.6"/>
      <rect x="15" y="63" width="68" height="6" rx="1" fill="#1A202C"/>
      <rect x="15" y="72" width="45" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="15" y="83" width="24" height="1.5" rx="0.75" fill={color} opacity="0.7"/>
      <rect x="15" y="88" width="30" height="2" rx="1" fill="#1A202C"/>
      <rect x="15" y="93" width="24" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="15" y="103" width="24" height="1.5" rx="0.75" fill={color} opacity="0.7"/>
      <rect x="15" y="108" width="30" height="2" rx="1" fill="#1A202C"/>
      <rect x="15" y="113" width="24" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="15" y="125" width="40" height="1.5" rx="0.75" fill="#CBD5E0"/>
    </svg>
  );
}

function FormalThumb({ color }) {
  return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="100" height="141" fill="white"/>
      <rect x="8" y="8" width="84" height="20" rx="2" fill={color}/>
      <rect x="15" y="13" width="70" height="3" rx="1" fill="white" opacity="0.9"/>
      <rect x="25" y="18" width="50" height="2" rx="1" fill="white" opacity="0.6"/>
      <rect x="25" y="32" width="50" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="30" y="36" width="40" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="8" y="44" width="84" height="36" rx="2" fill="white" stroke={color} strokeWidth="1.5"/>
      <rect x="20" y="50" width="60" height="2" rx="1" fill={color} opacity="0.6"/>
      <rect x="15" y="56" width="70" height="5" rx="1" fill="#1A202C"/>
      <rect x="22" y="64" width="56" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="28" y="68" width="44" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="8" y="88" width="36" height="2" rx="1" fill={color}/>
      <rect x="8" y="93" width="28" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="8" y="97" width="22" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="56" y="88" width="36" height="2" rx="1" fill={color}/>
      <rect x="56" y="93" width="28" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="56" y="97" width="22" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="8" y="112" width="84" height="1" fill={color} opacity="0.4"/>
      <rect x="20" y="117" width="60" height="1.5" rx="0.75" fill="#CBD5E0"/>
    </svg>
  );
}

function ElegantThumb({ color }) {
  return (
    <svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="100" height="141" fill="white"/>
      <rect x="0" y="0" width="100" height="6" fill={color}/>
      <rect x="0" y="135" width="100" height="6" fill={color}/>
      <circle cx="50" cy="24" r="8" fill={color} opacity="0.12"/>
      <rect x="20" y="38" width="60" height="3" rx="1" fill={color}/>
      <rect x="28" y="44" width="44" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="25" y="54" width="50" height="0.8" fill={color} opacity="0.3"/>
      <rect x="35" y="62" width="30" height="2" rx="1" fill={color} opacity="0.6"/>
      <rect x="15" y="68" width="70" height="5" rx="1" fill="#1A202C"/>
      <rect x="22" y="76" width="56" height="2" rx="1" fill="#CBD5E0"/>
      <rect x="25" y="86" width="50" height="0.8" fill="#E2E8F0"/>
      <rect x="10" y="93" width="36" height="1.5" rx="0.75" fill={color} opacity="0.7"/>
      <rect x="10" y="98" width="30" height="2" rx="1" fill="#1A202C"/>
      <rect x="10" y="103" width="24" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="54" y="93" width="36" height="1.5" rx="0.75" fill={color} opacity="0.7"/>
      <rect x="54" y="98" width="30" height="2" rx="1" fill="#1A202C"/>
      <rect x="54" y="103" width="24" height="1.5" rx="0.75" fill="#CBD5E0"/>
      <rect x="32" y="116" width="36" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
    </svg>
  );
}

const thumbMap = { classic: ClassicThumb, modern: ModernThumb, formal: FormalThumb, elegant: ElegantThumb };

/**
 * Template selector grid showing mini previews for each template.
 */
export default function TemplateSelector({ selected, themeColor, onChange }) {
  const radioRefs = useRef([]);

  return (
    <div className="template-grid" role="radiogroup" aria-label="Cover page template">
      {templateOptions.map((tpl, index) => {
        const Thumb = thumbMap[tpl.id];
        const isSelected = selected === tpl.id;

        return (
          <button
            key={tpl.id}
            type="button"
            className={`template-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onChange(tpl.id)}
            role="radio"
            aria-checked={isSelected}
            ref={(element) => { radioRefs.current[index] = element; }}
            tabIndex={isSelected ? 0 : -1}
            onKeyDown={(event) => {
              const isPrevious = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
              const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown';
              const nextIndex = isPrevious
                ? (index - 1 + templateOptions.length) % templateOptions.length
                : isNext
                  ? (index + 1) % templateOptions.length
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? templateOptions.length - 1
                      : -1;

              if (nextIndex >= 0) {
                event.preventDefault();
                onChange(templateOptions[nextIndex].id);
                radioRefs.current[nextIndex]?.focus();
              }
            }}
            id={`template-${tpl.id}`}
          >
            <div className="template-preview-thumb">
              <Thumb color={themeColor || tpl.previewColor} />
            </div>
            <div className="template-name">{tpl.name}</div>
            <div className="template-desc">{tpl.description}</div>

            {isSelected && (
              <div className="template-selected-badge" aria-hidden="true">
                <Check size={12} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
