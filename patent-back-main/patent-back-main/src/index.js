import { GraphQLServer } from 'graphql-yoga';
import { startDB, models } from './db';
import resolvers from './graphql/resolvers';

const db = startDB({
  user: 'deploy',
  pwd: 'patente',
  db: 'patent',
  url: 'cluster0.riwqs.mongodb.net'
})

const context = {
  models,
  db,
}

const Server = new GraphQLServer({
  typeDefs: `${__dirname}/graphql/schema.graphql`,
  resolvers,
  context: req => ({
    ...req,
    ...context
  })
})

// options
const opts = {
  port: process.env.PORT || 8081,
};


Server.start(opts, () => {
  console.log(`Server is running on http://localhost:${opts.port}`);
});
