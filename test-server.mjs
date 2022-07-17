import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import http from 'http';
import { createHandler } from './lib/index.mjs';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'world',
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: {
      greetings: {
        type: GraphQLString,
        subscribe: async function* () {
          for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
            yield { greetings: hi };
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        },
      },
    },
  }),
});

const handler = createHandler({ schema });

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/graphql/stream')) {
    return res.writeHead(404).end();
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      // preflight
      return res.writeHead(204).end();
    }

    return await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500);
    }
    return res.end();
  }
});

server.listen(4000);
console.log('Listening to port 4000');
