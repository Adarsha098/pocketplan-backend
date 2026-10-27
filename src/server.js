import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'

const app = express()
const port = process.env.PORT || 5000
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'personal-finance-tracker-api' }))
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET. Copy .env.example to .env and set a secret.')
    process.exit(1)
  }
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Set it in server/.env.')
    process.exit(1)
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message)
    process.exit(1)
  }
}
start()
