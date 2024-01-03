import mongoose from 'mongoose'

import User from './user.js'
import Company from './company.js'
import Diagnostico from './diagnostico.js'

// SET UP Mongoose Promises.
mongoose.Promise = global.Promise;

export const startDB = ({ user, pwd, url, db }) => mongoose.connect(`mongodb+srv://${user}:${pwd}@${url}/${db}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

export const models = {
  User,
  Company,
  Diagnostico
}
