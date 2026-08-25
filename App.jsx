import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { scoreProduct, perServePrice, buildVerdict } from './scoring'

const SEED_PRODUCTS = [
  { name: "Carman's Oat Slice - Apple Cinnamon", price: 5.5, servePerPack: 5, cal: 165, protein: 3.2, sugar: 9.5, fibre: 3.5, sodium: 60, stars: 4, ingredients: 'oats, dates, apple, cinnamon, sunflower oil' },
  { name: 'Uncle Tobys Oats Bar - Choc Chip', price: 4.2, servePerPack: 6, cal: 145, protein: 2.1, sugar: 12.8, fibre: 1.8, sodium: 95, stars: 3, ingredients: 'oats, sugar, choc chips, glucose syrup, vegetable oil' },
  { name: 'Woolworths Macro Oat Bar - Honey Almond', price: 4.8, servePerPack: 5, cal: 155, protein: 4.0, sugar: 8.0, fibre: 4.2, sodium: 45, stars: 4.5, ingredients: 'oats, honey, almonds, sunflower oil' },
]

const EMPTY_FORM = { name: '', price: '', cal: '', protein: '', sugar: '', fibre: '', sodium: '', stars: '', ingredients: '' }

export default function App() {
  const [products, setProducts] = useState(SEED_PRODUCTS)
  const [idxA, setIdxA] = useState(0)
  const [idxB, setIdxB] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true })

      if (!fetchError && data && data.length > 0) {
        setProducts(data.map(d => ({ ...d, servePerPack: d.serve_per_pack })))
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  const pa = products[idxA]
  const pb = products[idxB]

  async function handleAddProduct(e) {
    e.preventDefault()
    const required = ['name', 'price', 'cal', 'protein', 'sugar', 'fibre', 'sodium', 'stars', 'ingredients']
    if (required.some(field => !form[field])) {
      setError('Fill in every field first.')
      return
    }
    setError('')

    const newProduct = {
      name: form.name,
      price: parseFloat(form.price),
      serve_per_pack: 1,
      cal: parseFloat(form.cal),
      protein: parseFloat(form.protein),
      sugar: parseFloat(form.sugar),
      fibre: parseFloat(form.fibre),
      sodium: parseFloat(form.sodium),
      stars: parseFloat(form.stars),
      ingredients: form.ingredients,
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert(newProduct)
      .select()

    if (insertError) {
      setError('Could not save — check your Supabase connection.')
      return
    }

    const saved = { ...data[0], servePerPack: data[0].serve_per_pack }
    setProducts(prev => [...prev, saved])
    setIdxB(products.length)
    setForm(EMPTY_FORM)
  }

  if (loading) return <p>Loading products…</p>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1>PantryPick</h1>
      <p>Compare two products, see which one's actually healthier and why.</p>

      <div style={{ display: 'flex', gap: 16, margin: '1.5rem 0' }}>
        <select value={idxA} onChange={e => setIdxA(+e.target.value)} style={{ flex: 1 }}>
          {products.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
        <select value={idxB} onChange={e => setIdxB(+e.target.value)} style={{ flex: 1 }}>
          {products.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
      </div>

      {pa && pb && (
        <>
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
            <p>{buildVerdict(pa, pb)}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[pa, pb].map((p, i) => (
              <div key={i} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
                <strong>{p.name}</strong>
                <p>Score: {scoreProduct(p)}/100</p>
                <p>Per serve: ${perServePrice(p).toFixed(2)}</p>
                <p>{p.cal} kcal · {p.protein}g protein · {p.sugar}g sugar · {p.fibre}g fibre · {p.sodium}mg sodium · {p.stars}★</p>
                <p style={{ fontSize: 12, color: '#666' }}>{p.ingredients}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <details style={{ marginTop: '2rem' }}>
        <summary>Add a new product</summary>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          <input placeholder="Product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Price ($)" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Calories per serve" type="number" value={form.cal} onChange={e => setForm({ ...form, cal: e.target.value })} />
          <input placeholder="Protein (g)" type="number" step="0.1" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
          <input placeholder="Sugar (g)" type="number" step="0.1" value={form.sugar} onChange={e => setForm({ ...form, sugar: e.target.value })} />
          <input placeholder="Fibre (g)" type="number" step="0.1" value={form.fibre} onChange={e => setForm({ ...form, fibre: e.target.value })} />
          <input placeholder="Sodium (mg)" type="number" value={form.sodium} onChange={e => setForm({ ...form, sodium: e.target.value })} />
          <input placeholder="Health star rating (0-5)" type="number" step="0.5" value={form.stars} onChange={e => setForm({ ...form, stars: e.target.value })} />
          <input placeholder="Ingredients (comma separated)" style={{ gridColumn: '1 / -1' }} value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} />
          {error && <p style={{ color: 'red', gridColumn: '1 / -1', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={{ gridColumn: '1 / -1' }}>Add product</button>
        </form>
      </details>
    </div>
  )
}
