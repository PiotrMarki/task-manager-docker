async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "API error");
  return data;
}

const catForm = document.getElementById("catForm");
const catName = document.getElementById("catName");
const catList = document.getElementById("catList");

const recipeForm = document.getElementById("recipeForm");
const recipeTitle = document.getElementById("recipeTitle");
const recipeIngredients = document.getElementById("recipeIngredients");
const recipeInstructions = document.getElementById("recipeInstructions");
const recipeCategory = document.getElementById("recipeCategory");
const recipeRating = document.getElementById("recipeRating");
const recipeList = document.getElementById("recipeList");
const filterCategory = document.getElementById("filterCategory");

let categories = [];
let recipes = [];

function stars(n) {
  const full = "★".repeat(n);
  const empty = "☆".repeat(5 - n);
  return full + empty;
}

function renderCategories() {
  catList.innerHTML = "";

  recipeCategory.innerHTML = `<option value="">(bez kategorii)</option>`;
  filterCategory.innerHTML = `<option value="">(wszystkie)</option>`;

  for (const c of categories) {
    const li = document.createElement("li");
    li.className = "item";

    const left = document.createElement("div");
    left.innerHTML = `<strong>${c.name}</strong>`;
    left.style.cursor = "pointer";
    left.title = "Kliknij aby zmienić nazwę";
    left.onclick = async () => {
      const newName = prompt("Nowa nazwa kategorii:", c.name);
      if (!newName) return;
      await api(`/api/categories/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: newName }),
      });
      await reload();
    };

    const actions = document.createElement("div");
    actions.className = "actions";

    const del = document.createElement("button");
    del.className = "danger";
    del.textContent = "Usuń";
    del.onclick = async () => {
      if (!confirm("Usunąć kategorię? (przepisy zostaną bez kategorii)")) return;
      await api(`/api/categories/${c.id}`, { method: "DELETE" });
      await reload();
    };

    actions.appendChild(del);
    li.appendChild(left);
    li.appendChild(actions);
    catList.appendChild(li);

    const opt1 = document.createElement("option");
    opt1.value = String(c.id);
    opt1.textContent = c.name;
    recipeCategory.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = String(c.id);
    opt2.textContent = c.name;
    filterCategory.appendChild(opt2);
  }
}

function renderRecipes() {
  recipeList.innerHTML = "";
  const filterId = filterCategory.value ? Number(filterCategory.value) : null;

  const visible = filterId ? recipes.filter(r => r.category_id === filterId) : recipes;

  for (const r of visible) {
    const li = document.createElement("li");
    li.className = "item";

    const left = document.createElement("div");
    const cat = r.category_name ? r.category_name : "bez kategorii";
    left.innerHTML = `
      <div>
        <strong>${r.title}</strong>
        <span class="badge">${cat}</span>
        <span class="badge">${stars(r.rating)} (${r.rating}/5)</span>
        <div style="margin-top:8px;"><small><b>Składniki:</b> ${r.ingredients}</small></div>
        <div style="margin-top:6px;"><small><b>Instrukcja:</b> ${r.instructions}</small></div>
      </div>
    `;

    left.style.cursor = "pointer";
    left.title = "Kliknij aby edytować przepis";
    left.onclick = async () => {
      const newTitle = prompt("Nowy tytuł:", r.title);
      if (!newTitle) return;

      const newIngredients = prompt("Nowe składniki:", r.ingredients);
      if (!newIngredients) return;

      const newInstructions = prompt("Nowa instrukcja:", r.instructions);
      if (!newInstructions) return;

      const newRatingStr = prompt("Nowa ocena (1-5):", String(r.rating));
      const newRating = Number(newRatingStr);
      if (!newRatingStr || Number.isNaN(newRating) || newRating < 1 || newRating > 5) {
        alert("Ocena musi być 1-5");
        return;
      }

      await api(`/api/recipes/${r.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: newTitle,
          ingredients: newIngredients,
          instructions: newInstructions,
          rating: newRating,
          category_id: r.category_id,
        }),
      });
      await reload();
    };

    const actions = document.createElement("div");
    actions.className = "actions";

    const del = document.createElement("button");
    del.className = "danger";
    del.textContent = "Usuń";
    del.onclick = async () => {
      if (!confirm("Usunąć przepis?")) return;
      await api(`/api/recipes/${r.id}`, { method: "DELETE" });
      await reload();
    };

    actions.appendChild(del);
    li.appendChild(left);
    li.appendChild(actions);
    recipeList.appendChild(li);
  }
}

async function reload() {
  categories = await api("/api/categories");
  recipes = await api("/api/recipes");
  renderCategories();
  renderRecipes();
}

catForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: catName.value }),
    });
    catName.value = "";
    await reload();
  } catch (err) {
    alert(err.message);
  }
});

recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const category_id = recipeCategory.value ? Number(recipeCategory.value) : null;
    const rating = Number(recipeRating.value);

    await api("/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        title: recipeTitle.value,
        ingredients: recipeIngredients.value,
        instructions: recipeInstructions.value,
        rating,
        category_id,
      }),
    });

    recipeTitle.value = "";
    recipeIngredients.value = "";
    recipeInstructions.value = "";
    recipeCategory.value = "";
    recipeRating.value = "3";
    await reload();
  } catch (err) {
    alert(err.message);
  }
});

filterCategory.addEventListener("change", () => renderRecipes());

reload().catch((e) => alert(e.message));
