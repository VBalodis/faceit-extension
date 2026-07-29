const { Client } = require("pg");
require("dotenv").config();

console.log("1. Script started");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

console.log("2. Client created");

(async () => {
  console.log("3. Before connect");

  try {
    await client.connect();
    console.log("4. Connected!");

    const result = await client.query("SELECT NOW()");
    console.log(result.rows);

    await client.end();
    console.log("5. Finished");
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
})();