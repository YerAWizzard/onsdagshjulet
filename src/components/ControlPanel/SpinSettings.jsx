function SpinSettings({ maxSeconds, minSeconds, onChange, t }) {
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
    </div>
  )
}

export default SpinSettings
