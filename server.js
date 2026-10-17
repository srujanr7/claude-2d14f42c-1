import express from "express";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT = 3000 } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.use(express.json());

// List all to-dos
app.get("/api/todos", async (req, res) => {
  const { data, error } = await supabase
    .from("todos")
    .select("id, title, done")
    .order("id", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create a to-do
app.post("/api/todos", async (req, res) => {
  const { title, done = false } = req.body ?? {};


  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be a boolean" });
  }

  const { data, error } = await supabase
    .from("todos")
    .insert({ title: title.trim(), done })
    .select("id, title, done")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.listen(PORT, () => {
  console.log(`To-do API listening on port ${PORT}`);
});