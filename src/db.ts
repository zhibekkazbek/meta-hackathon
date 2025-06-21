import mongoose from 'mongoose'

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ MongoDB connected')
  })
  .catch(console.error)
