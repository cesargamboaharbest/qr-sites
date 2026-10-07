import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { errorMessage, t } from '../../i18n/index.js'
import { formatPrice } from '../../utils/format.js'
import { groupByCategory } from '../../utils/products.js'
import { getTheme } from '../../themes/index.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import PreviewFrame from '../../components/PreviewFrame.jsx'
import ImageField from '../../components/ImageField.jsx'
import TwoColumnsToggle from '../../components/TwoColumnsToggle.jsx'
import { PLACEHOLDER_IMAGE } from '../../utils/products.js'

const EMPTY_PRODUCT = { name: '', category: '', price: '', description: '', imageUrl: '' }

// `imageBusinessId` turns on the photo upload (menus with a cart only)
function ProductForm({
  initial = EMPTY_PRODUCT,
  categories,
  sections,
  imageBusinessId,
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const { imageUrl, ...fields } = form
      await onSubmit({
        ...fields,
        price: Number(form.price),
        ...(imageBusinessId && { imageUrl: imageUrl ?? '' }),
      })
      if (!onCancel) setForm({ ...EMPTY_PRODUCT, category: form.category })
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>{t('products.name')}</span>
        <input value={form.name} onChange={update('name')} placeholder={t('products.namePlaceholder')} required maxLength={120} />
      </label>
      {/* Menus without a cart call categories "sections", like the printed Kura menu */}
      <label className="field">
        <span>{t(sections ? 'products.section' : 'products.category')}</span>
        <input
          value={form.category}
          onChange={update('category')}
          placeholder={t(sections ? 'products.sectionPlaceholder' : 'products.categoryPlaceholder')}
          list="product-categories"
          required={sections}
          maxLength={60}
        />
      </label>
      <label className="field">
        <span>{t('products.price')}</span>
        <input type="number" inputMode="decimal" min="0" step="any" value={form.price} onChange={update('price')} required />
      </label>
      <label className="field field-wide">
        <span>{t('products.description')}</span>
        <input
          value={form.description}
          onChange={update('description')}
          placeholder={t('products.descriptionPlaceholder')}
          maxLength={500}
        />
      </label>
      {imageBusinessId && (
        <div className="field-wide">
          <ImageField
            businessId={imageBusinessId}
            value={form.imageUrl}
            onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
            onBusyChange={setUploading}
          />
        </div>
      )}
      <datalist id="product-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {error && <p className="form-error field-wide" role="alert">{error}</p>}
      <div className="form-actions field-wide">
        <button className="btn btn-primary" disabled={pending || uploading}>
          {pending ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('app.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}

function ProductRow({ product, business, categories, mutate }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const path = `/products/${product._id}`

  async function run(action) {
    setError('')
    try {
      await action()
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }

  if (editing) {
    return (
      <li className="product-row is-editing">
        <ProductForm
          initial={{ ...product, price: String(product.price) }}
          categories={categories}
          sections={!business.ordering}
          imageBusinessId={business.ordering ? business.id : undefined}
          submitLabel={t('app.save')}
          pendingLabel={t('app.saving')}
          onSubmit={async (fields) => {
            await mutate(path, 'PATCH', fields)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={`product-row ${product.available ? '' : 'is-sold-out'}`}>
      <div className={`product-info ${business.ordering ? 'has-thumb' : ''}`}>
        {business.ordering && <img src={product.imageUrl || PLACEHOLDER_IMAGE} alt="" className="product-thumb" />}
        <div>
          <strong>{product.name}</strong>
          {!product.available && <span className="badge badge-warn">{t('products.soldOut')}</span>}
          {product.description && <p className="muted">{product.description}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </div>
      <span className="product-price">{formatPrice(product.price, business.currency)}</span>
      <div className="row-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => run(() => mutate(path, 'PATCH', { available: !product.available }))}
        >
          {t(product.available ? 'products.markSoldOut' : 'products.markAvailable')}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
          {t('app.edit')}
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() =>
            window.confirm(t('products.deleteConfirm', { name: product.name })) && run(() => mutate(path, 'DELETE'))
          }
        >
          {t('app.delete')}
        </button>
      </div>
    </li>
  )
}

export default function ProductsTab() {
  const { business, mutate } = useOutletContext()
  const { user } = useAuth()
  const groups = groupByCategory(business.products, t('products.uncategorized'))
  const categories = [...new Set(business.products.map((p) => p.category).filter(Boolean))]

  const editor = (
    <div className="stack">
      <section className="card">
        <h2>{t('products.addTitle')}</h2>
        {!business.ordering && <p className="muted">{t('products.sectionHint')}</p>}
        <ProductForm
          categories={categories}
          sections={!business.ordering}
          imageBusinessId={business.ordering ? business.id : undefined}
          submitLabel={t('products.add')}
          pendingLabel={t('products.adding')}
          onSubmit={(fields) => mutate('/products', 'POST', fields)}
        />
      </section>

      <section className="card">
        <h2>{t('products.title')}</h2>
        {business.products.length === 0 && <p className="muted">{t('products.empty')}</p>}
        {groups.map((group) => (
          <div key={group.category} className="product-group">
            <h3>{group.category}</h3>
            <ul className="product-list">
              {group.items.map((p) => (
                <ProductRow key={p._id} product={p} business={business} categories={categories} mutate={mutate} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )

  if (business.ordering) return editor

  // Menus without a cart get a live preview of the public page, styled with
  // the owner's theme (top navigation) and showing only what customers see
  const { Menu } = getTheme(user.theme)
  const previewBusiness = { ...business, products: business.products.filter((p) => p.available) }

  return (
    <div className="products-layout">
      {editor}
      <aside className="menu-preview" aria-label={t('products.preview')}>
        <h2>{t('products.preview')}</h2>
        <p className="muted">{t('products.previewHint')}</p>
        <TwoColumnsToggle business={business} mutate={mutate} />
        <PreviewFrame title={t('products.preview')} className="menu-preview-frame">
          <Menu business={previewBusiness} />
        </PreviewFrame>
      </aside>
    </div>
  )
}
