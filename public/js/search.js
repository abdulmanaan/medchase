const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const list = document.getElementById("results");

let timer; // pending debounce timer
let latestSearch = 0; // number of the newest search

// Replace the list with a single message
function showMessage(text) {
  list.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}

// Create a span with a class and text
function createSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

async function searchMedicines(medicineName) {
  const searchId = ++latestSearch;

  try {
    // Ask the API
    const response = await fetch(
      "/api/search?medicine=" + encodeURIComponent(medicineName),
    );
    if (searchId !== latestSearch) return;
    if (!response.ok) {
      return showMessage("Something went wrong. Please try again.");
    }

    const medicines = await response.json();
    if (searchId !== latestSearch) return;

    // Nothing found
    if (medicines.length === 0) {
      return showMessage("Not available at any pharmacy");
    }

    // Replace old results with new ones
    list.innerHTML = "";
    for (const medicine of medicines) {
      const li = document.createElement("li");
      li.appendChild(createSpan("result-medicine", medicine.name));
      li.appendChild(createSpan("result-pharmacy", medicine.pharmacy.name));
      li.appendChild(createSpan("result-location", medicine.pharmacy.location));
      list.appendChild(li);
    }
  } catch (error) {
    console.error(error);
    if (searchId === latestSearch) {
      showMessage("Something went wrong. Please try again.");
    }
  }
}

// Search on submit or Enter key
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(timer);
  searchMedicines(input.value.trim());
});

// Typing: search after the user pauses
input.addEventListener("input", () => {
  clearTimeout(timer);
  const medicineName = input.value.trim();

  // Cancel pending searches and clear the list if empty
  if (!medicineName) {
    latestSearch++;
    list.innerHTML = "";
    return;
  }

  timer = setTimeout(() => searchMedicines(medicineName), 300);
});
