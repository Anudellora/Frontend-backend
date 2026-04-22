const mongoose = require('mongoose');

// Счётчик для автоинкремента числового поля id
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    first_name: { type: String, required: true, trim: true, maxlength: 100 },
    last_name:  { type: String, required: true, trim: true, maxlength: 100 },
    age:        { type: Number, required: true, min: 0, max: 150 },
    // Unix-время (секунды)
    created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updated_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    const counter = await Counter.findByIdAndUpdate(
      'user_id',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.seq;
  }
  if (!this.isNew) {
    this.updated_at = Math.floor(Date.now() / 1000);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
