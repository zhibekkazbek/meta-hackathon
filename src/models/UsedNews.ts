import mongoose from 'mongoose'

const UsedNewsSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  usedAt: { type: Date, default: Date.now }
})

export const UsedNews = mongoose.model('UsedNews', UsedNewsSchema)
