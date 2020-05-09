import mongoose from 'mongoose';

const fixtureSchema = new mongoose.Schema({
  home_team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teams',
  },
  away_team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teams',
  },
  match_date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  scores: {
    home_team: {
      type: Number,
      default: 0,
    },
    away_team: {
      type: Number,
      default: 0,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('fixtures', fixtureSchema);
