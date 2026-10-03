import { t } from '../i18n/index.js'

// Red "Parte del plan Pro" chip shown next to locked Pro features
export default function ProChip() {
  return <span className="pro-chip">{t('plan.proChip')}</span>
}
