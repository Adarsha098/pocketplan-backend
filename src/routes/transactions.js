import { Router } from 'express'
import mongoose from 'mongoose'
import auth from '../middleware/auth.js'
import Transaction from '../models/Transaction.js'

const router = Router()
router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const items = await Transaction.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).lean()
    res.json(items.map(item => ({ ...item, _id: item._id.toString() })))
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const { title, amount, type, category, date, note = '' } = req.body
    if (!String(title || '').trim()) return res.status(400).json({ message: 'Description is required.' })
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ message: 'Amount must be greater than zero.' })
    if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Choose income or expense.' })
    if (!String(category || '').trim()) return res.status(400).json({ message: 'Category is required.' })
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return res.status(400).json({ message: 'Enter a valid date.' })
    const item = await Transaction.create({
      user: req.userId, title: String(title).trim(), amount: Number(amount),
      type, category: String(category).trim(), date, note: String(note).trim()
    })
    res.status(201).json({ ...item.toObject(), _id: item._id.toString() })
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID.' })
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!result) return res.status(404).json({ message: 'Transaction not found.' })
    res.json({ message: 'Transaction deleted.' })
  } catch (error) { next(error) }
})

export default router
