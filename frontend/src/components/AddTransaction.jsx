import { useState, useEffect } from 'react'
import { addTransaction } from '../utils/api'
import './AddTransaction.css'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Entertainment', 'Health', 'Education', 'Investment', 'Other']

const CAT_EMOJI = {
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Bills: '📋',
  Salary: '💼', Entertainment: '🎬', Health: '🏥',
  Education: '📚', Investment: '📈', Other: '📦'
}

export default function AddTransaction({ onAdded }) {
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    tags: '',
    receiptDataUrl: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    recurringNextRunDate: new Date().toISOString().split('T')[0],
    recurringEndDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      // Parse voice: "spent 500 on food for zomato" or "received 5000 salary"
      const lower = transcript.toLowerCase()
      let detectedType = lower.includes('received') || lower.includes('income') || lower.includes('salary') ? 'income' : 'expense'
      const amtMatch = transcript.match(/\d+/)
      const amount = amtMatch ? amtMatch[0] : form.amount
      setForm(f => ({ ...f, description: transcript, amount, type: detectedType }))
    }

    recognition.onerror = () => setListening(false)
    recognition.start()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.amount || parseFloat(form.amount) <= 0) {
      return setError('Valid amount enter karo')
    }

    if (form.isRecurring && !form.recurringNextRunDate) {
      return setError('Recurring next run date choose karo')
    }

    const tags = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    setLoading(true)
    try {
      await addTransaction({
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
        note: form.note,
        tags,
        receiptDataUrl: form.receiptDataUrl,
        isRecurring: form.isRecurring,
        recurring: form.isRecurring
          ? {
              frequency: form.recurringFrequency,
              nextRunDate: form.recurringNextRunDate,
              endDate: form.recurringEndDate || undefined,
            }
          : undefined,
      })
      onAdded()
      setForm(f => ({
        ...f,
        amount: '',
        description: '',
        note: '',
        tags: '',
        receiptDataUrl: '',
        isRecurring: false,
        recurringFrequency: 'monthly',
        recurringNextRunDate: new Date().toISOString().split('T')[0],
        recurringEndDate: '',
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction add nahi ho paya')
    } finally {
      setLoading(false)
    }
  }

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Sirf image receipt upload karo')
      return
    }

    if (file.size > 1024 * 1024) {
      setError('Receipt image 1MB se chhoti honi chahiye')
      return
    }

    setError('')
    setUploadingReceipt(true)
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, receiptDataUrl: String(reader.result || '') }))
      setUploadingReceipt(false)
    }
    reader.onerror = () => {
      setError('Receipt upload nahi ho payi')
      setUploadingReceipt(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="add-txn-card card">
      <div className="add-txn-header">
        <h2>Transaction Add Karo</h2>
        {voiceSupported && (
          <button
            type="button"
            className={`voice-btn ${listening ? 'listening' : ''}`}
            onClick={handleVoice}
            title="Voice se add karo"
          >
            {listening ? '🔴 Bol raha hoon...' : '🎤 Voice'}
          </button>
        )}
      </div>

      <div className="type-toggle">
        <button
          type="button"
          className={`type-btn ${form.type === 'income' ? 'active-income' : ''}`}
          onClick={() => setForm({ ...form, type: 'income', category: 'Salary' })}
        >
          ↑ Income
        </button>
        <button
          type="button"
          className={`type-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
          onClick={() => setForm({ ...form, type: 'expense', category: 'Food' })}
        >
          ↓ Expense
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        <div className="add-grid">
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              className="form-input"
              placeholder="Kya hua? (e.g. Zomato order)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '4px' }}>
          <label className="form-label">Note (optional)</label>
          <input
            className="form-input"
            placeholder="Extra info..."
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginTop: '10px' }}>
          <label className="form-label">Tags (comma separated)</label>
          <input
            className="form-input"
            placeholder="vacation, office, ghar"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginTop: '10px' }}>
          <label className="form-label">Receipt Upload</label>
          <input type="file" className="form-input" accept="image/*" onChange={handleReceiptUpload} />
          {uploadingReceipt && <small className="helper-text">Uploading...</small>}
          {form.receiptDataUrl && <small className="helper-text success">Receipt attached</small>}
        </div>

        <div className="recurring-box">
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={e => setForm({ ...form, isRecurring: e.target.checked })}
            />
            <span>Recurring transaction bana do</span>
          </label>

          {form.isRecurring && (
            <div className="add-grid" style={{ marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select
                  className="form-input"
                  value={form.recurringFrequency}
                  onChange={e => setForm({ ...form, recurringFrequency: e.target.value })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Next run date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.recurringNextRunDate}
                  onChange={e => setForm({ ...form, recurringNextRunDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End date (optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.recurringEndDate}
                  onChange={e => setForm({ ...form, recurringEndDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`btn ${form.type === 'income' ? 'btn-income' : 'btn-expense'}`}
          style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? 'Adding...' : `${form.type === 'income' ? '+ Income' : '- Expense'} Add Karo`}
        </button>
      </form>
    </div>
  )
}
