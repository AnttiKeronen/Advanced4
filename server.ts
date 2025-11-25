import express, { Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import { promises as fs } from "fs";

interface TUser {
  name: string;
  todos: string[];
}
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "..", "data.json");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..", "public")));
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}
async function readUsers(): Promise<TUser[]> {
  await ensureDataFile();
  const text = await fs.readFile(DATA_FILE, "utf8");
  if (!text.trim()) return [];
  return JSON.parse(text);
}
async function writeUsers(users: TUser[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}
app.post("/add", async (req: Request, res: Response) => {
  const { name, todo } = req.body;
  if (!name || !todo) {
    return res.status(400).send("Name and todo!!.");
  }
  const users = await readUsers();
  const lower = name.toLowerCase();
  let user = users.find((u) => u.name.toLowerCase() === lower);

  if (user) {
    user.todos.push(todo);
  } else {
    user = { name, todos: [todo] };
    users.push(user);
  }

  await writeUsers(users);
  res.send(`Tekemistä käyttäjälle: ${name}.`);
});


app.get("/todos/:id", async (req: Request, res: Response) => {
  const searchName = req.params.id.toLowerCase();
  const users = await readUsers();

  const user = users.find((u) => u.name.toLowerCase() === searchName);
  if (!user) return res.status(404).send("Ei löydy");

  res.json(user);
});
app.delete("/delete", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Anna nimi");
  const lower = name.toLowerCase();
  const users = await readUsers();
  const idx = users.findIndex((u) => u.name.toLowerCase() === lower);
  if (idx === -1) return res.status(404).send("Ei löydy");
  users.splice(idx, 1);
  await writeUsers(users);
  res.send("Poistettu boss.");
});
app.put("/update", async (req: Request, res: Response) => {
  const { name, todo } = req.body;
  if (!name || !todo) return res.status(400).send("Anna nimi ja tekeminen");
  const users = await readUsers();
  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return res.status(404).send("Ei löydy");

  const i = user.todos.indexOf(todo);
  if (i === -1) return res.status(404).send("Ei löydy");

  user.todos.splice(i, 1);
  await writeUsers(users);

  res.send("Poistettu.");
  
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
