import { useEffect, useState } from 'react'
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

// Products grouped in collapsible sections that can be moved up and down
// (saved as Business.categoryOrder). Products without a section stay last.
// `added` ({ key }) opens the section a product was just added to.
function SectionList({ groups, business, categories, mutate, added }) {
  const [open, setOpen] = useState(() => new Set(groups.length === 1 ? [groups[0].key] : []))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const named = groups.filter((g) => g.key !== '')

  useEffect(() => {
    if (added) setOpen((current) => new Set(current).add(added.key))
  }, [added])

  function toggle(key) {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function move(index, delta) {
    const order = named.map((g) => g.key)
    ;[order[index], order[index + delta]] = [order[index + delta], order[index]]
    setPending(true)
    setError('')
    try {
      await mutate('', 'PATCH', { categoryOrder: order })
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  if (groups.length === 0) return null
  const allOpen = groups.every((g) => open.has(g.key))

  return (
    <>
      <div className="section-toolbar">
        <span className="muted">
          {t(business.ordering ? 'products.categoryCount' : 'products.sectionCount', { count: groups.length })}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen(new Set(allOpen ? [] : groups.map((g) => g.key)))}
        >
          {t(allOpen ? 'products.collapseAll' : 'products.expandAll')}
        </button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <ol className="section-list">
        {groups.map((group) => {
          const index = named.indexOf(group)
          const isOpen = open.has(group.key)
          const panelId = `section-panel-${group.id}`
          return (
            <li key={group.key} className={`section-panel ${isOpen ? 'is-open' : ''}`}>
              <div className="section-head">
                <button
                  type="button"
                  className="section-toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(group.key)}
                >
                  <span className="section-chevron" aria-hidden="true">
                    ▸
                  </span>
                  {index !== -1 && <span className="section-number">{index + 1}</span>}
                  <span className="section-name">{group.category}</span>
                  <span className="badge">{t('products.productCount', { count: group.items.length })}</span>
                </button>
                {index !== -1 && named.length > 1 && (
                  <span className="section-move">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => move(index, -1)}
                      disabled={pending || index === 0}
                      aria-label={t('products.moveUp', { name: group.category })}
                      title={t('products.moveUp', { name: group.category })}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => move(index, 1)}
                      disabled={pending || index === named.length - 1}
                      aria-label={t('products.moveDown', { name: group.category })}
                      title={t('products.moveDown', { name: group.category })}
                    >
                      ↓
                    </button>
                  </span>
                )}
              </div>
              {isOpen && (
                <ul id={panelId} className="product-list section-body">
                  {group.items.map((p) => (
                    <ProductRow key={p._id} product={p} business={business} categories={categories} mutate={mutate} />
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}

export default function ProductsTab() {
  const { business, mutate } = useOutletContext()
  const { user } = useAuth()
  const groups = groupByCategory(business.products, t('products.uncategorized'), business.categoryOrder)
  const categories = [...new Set(business.products.map((p) => p.category).filter(Boolean))]
  const [added, setAdded] = useState(null)

  async function addProduct(fields) {
    await mutate('/products', 'POST', fields)
    setAdded({ key: fields.category.trim() })
  }

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
          onSubmit={addProduct}
        />
      </section>

      <section className="card">
        <h2>{t('products.title')}</h2>
        {business.products.length === 0 && <p className="muted">{t('products.empty')}</p>}
        <SectionList groups={groups} business={business} categories={categories} mutate={mutate} added={added} />
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
