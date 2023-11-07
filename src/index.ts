import "dotenv/config";
import express from "express";
import postgraphile, { gql, makeExtendSchemaPlugin } from "postgraphile";
import axios from "axios";

const app = express();

const RegisterNetCallPlugin = makeExtendSchemaPlugin((_build) => ({
  typeDefs: gql`
    type Todo {
      userId: Int
      id: Int
      title: String
      completed: Boolean
    }

    extend type Query {
      getTodo(id: Int): Todo
    }
  `,
  resolvers: {
    Query: {
      getTodo: async (_query, args, _context, _resolveInfo) => {
        const todo = await axios.get(
          `https://jsonplaceholder.typicode.com/todos/${args.id}`
        );
        return todo.data;
      },
    },
  },
}));

const postgraphileMiddleware = postgraphile(
  process.env.DATABASE_URL,
  process.env.DATABASE_SCHEMA,
  {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    appendPlugins: [RegisterNetCallPlugin],
  }
);

app.use(postgraphileMiddleware);

app.get("/", (req, res) => {
  res.send("OK!");
});

app.listen(process.env.PORT, () => {
  console.log(`Application listening on http://localhost:${process.env.PORT}`);
});
