const todoForm = document.getElementById("todoForm");
const userInput = document.getElementById("userInput");
const todoInput = document.getElementById("todoInput");
const submitButton = document.getElementById("submit-data");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("search");
const deleteUserButton = document.getElementById("deleteUser");
const todoList = document.getElementById("todoList");
const messageElement = document.getElementById("message");
let currentUserName = null;
function showMessage(text) {
  messageElement.textContent = text;
}
function renderTodos(user) {
  todoList.innerHTML = "";
  if (!user || !user.todos || user.todos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No todos.";
    todoList.appendChild(li);
    return;
  }
  user.todos.forEach((todo) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = todo;
    a.classList.add("delete-task");
    a.dataset.todo = todo; 
    a.addEventListener("click", async (event) => {
      event.preventDefault();
      if (!currentUserName) return;
      try {
        const res = await fetch("/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: currentUserName,
            todo: a.dataset.todo,
          }),
        });
        const text = await res.text();
        showMessage(text);
        if (res.ok) {
          fetchUserTodos(currentUserName);
        }
      } catch (err) {
        console.error(err);
        showMessage("Error deleting todo.");
      }
    });
    li.appendChild(a);
    todoList.appendChild(li);
  });
}
todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = userInput.value.trim();
  const todo = todoInput.value.trim();
  if (!name || !todo) {
    showMessage("Anna molemmat infot");
    return;
  }
  try {
    const res = await fetch("/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, todo }),
    });
    const text = await res.text();
    showMessage(text);
    if (res.ok && currentUserName && currentUserName.toLowerCase() === name.toLowerCase()) {
      fetchUserTodos(currentUserName);
    }
    todoInput.value = "";
  } catch (err) {
    console.error(err);
    showMessage("Errori");
  }
});
async function fetchUserTodos(name) {
  try {
    const res = await fetch(`/todos/${encodeURIComponent(name)}`);
    if (!res.ok) {
      const text = await res.text();
      showMessage(text || "Ei löy y");
      todoList.innerHTML = "";
      deleteUserButton.style.display = "nada";
      currentUserName = null;
      return;
    }
    const user = await res.json();
    currentUserName = user.name;
    showMessage(`Todos for user ${user.name}:`);
    renderTodos(user);
    deleteUserButton.style.display = "inline-block";
  } catch (err) {
    console.error(err);
    showMessage("Errori");
  }
}
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = searchInput.value.trim();
  if (!name) {
    showMessage("Laitaha nimi");
    return;
  }
  fetchUserTodos(name);
});
deleteUserButton.addEventListener("click", async () => {
  if (!currentUserName) return;
  try {
    const res = await fetch("/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: currentUserName }),
    });
    const text = await res.text();
    showMessage(text);
    if (res.ok) {
      todoList.innerHTML = "";
      deleteUserButton.style.display = "none";
      currentUserName = null;
    }
  } catch (err) {
    console.error(err);
    showMessage("Errori.");
  }
});
