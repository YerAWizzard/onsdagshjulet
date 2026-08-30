import { PERFORMANCE_MODES } from '../../lib/performanceStorage.js'

function SpinSettings({
  maxSeconds,
  minSeconds,
  onChange,
  onPerformanceModeChange,
  performanceMode,
  t,
}) {
  return (
    <div className="settings-content spin-settings">
      <p className="panel-help">{t('spinSettings.help')}</p>
      <label className="range-setting">
        <span>{t('spinSettings.minimum')}</span>
        <input max="11" min="2" onChange={(event) => onChange({ minSeconds: Math.min(Number(event.target.value), maxSeconds) })} type="range" value={minSeconds} />
        <strong>{t('spinSettings.seconds', { value: minSeconds })}</strong>
      </label>
      <label className="range-setting">
        <span>{t('spinSettings.maximum')}</span>
        <input max="11" min="2" onChange={(event) => onChange({ maxSeconds: Math.max(Number(event.target.value), minSeconds) })} type="range" value={maxSeconds} />
        <strong>{t('spinSettings.seconds', { value: maxSeconds })}</strong>
      </label>
      <div className="performance-setting">
        <strong>{t('performance.label')}</strong>
        <div aria-label={t('performance.label')} className="performance-modes" role="group">
          {PERFORMANCE_MODES.map((mode) => (
            <button
              aria-pressed={performanceMode === mode}
              className={performanceMode === mode ? 'is-active' : ''}
              key={mode}
              onClick={() => onPerformanceModeChange(mode)}
              type="button"
            >
              {t(`performance.modes.${mode}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SpinSettings
