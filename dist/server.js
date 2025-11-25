"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const app = (0, express_1.default)();
const PORT = 3000;
const DATA_FILE = path_1.default.join(__dirname, "..", "data.json");
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
/*-----------------------------------------------------------
   FILE HELPERS
-----------------------------------------------------------*/
async function ensureDataFile() {
    try {
        await fs_1.promises.access(DATA_FILE);
    }
    catch {
        await fs_1.promises.writeFile(DATA_FILE, "[]", "utf8");
    }
}
async function readUsers() {
    await ensureDataFile();
    const text = await fs_1.promises.readFile(DATA_FILE, "utf8");
    if (!text.trim())
        return [];
    return JSON.parse(text);
}
async function writeUsers(users) {
    await fs_1.promises.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}
/*-----------------------------------------------------------
   ROUTES
-----------------------------------------------------------*/
// 1. Add user + todo
app.post("/add", async (req, res) => {
    const { name, todo } = req.body;
    if (!name || !todo) {
        return res.status(400).send("Name and todo are required.");
    }
    const users = await readUsers();
    const lower = name.toLowerCase();
    let user = users.find((u) => u.name.toLowerCase() === lower);
    if (user) {
        user.todos.push(todo);
    }
    else {
        user = { name, todos: [todo] };
        users.push(user);
    }
    await writeUsers(users);
    res.send(`Todo added successfully for user ${name}.`);
});
// 2. Get todos for a user
app.get("/todos/:id", async (req, res) => {
    const searchName = req.params.id.toLowerCase();
    const users = await readUsers();
    const user = users.find((u) => u.name.toLowerCase() === searchName);
    if (!user)
        return res.status(404).send("User not found");
    res.json(user);
});
// 3. Delete user
app.delete("/delete", async (req, res) => {
    const { name } = req.body;
    if (!name)
        return res.status(400).send("Name required.");
    const lower = name.toLowerCase();
    const users = await readUsers();
    const idx = users.findIndex((u) => u.name.toLowerCase() === lower);
    if (idx === -1)
        return res.status(404).send("User not found");
    users.splice(idx, 1);
    await writeUsers(users);
    res.send("User deleted successfully.");
});
// 4. Delete single todo
app.put("/update", async (req, res) => {
    const { name, todo } = req.body;
    if (!name || !todo)
        return res.status(400).send("Name and todo required.");
    const users = await readUsers();
    const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
    if (!user)
        return res.status(404).send("User not found");
    const i = user.todos.indexOf(todo);
    if (i === -1)
        return res.status(404).send("Todo not found");
    user.todos.splice(i, 1);
    await writeUsers(users);
    res.send("Todo deleted successfully.");
});
/*-----------------------------------------------------------
   START SERVER
-----------------------------------------------------------*/
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map