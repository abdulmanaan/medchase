const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const list = document.getElementById("results");

// Show a single message inside results list
function showMessage(text) {
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
  // Clear old results
  list.innerHTML = "";

  try {
    // Ask the API
    const response = await fetch(
      "/api/search?medicine=" + encodeURIComponent(medicineName),
    );
    if (!response.ok) {
      return showMessage("Something went wrong. Please try again.");
    }
    const medicines = await response.json();

    // Noting found
    if (medicines.length === 0) {
      return showMessage("Not availabe at any pharmacy.");
    }

    // One list item per result
    for (const medicine of medicines) {
      const li = document.createElement("li");
      li.appendChild(createSpan("result-medicine", medicine.name));
      li.appendChild(createSpan("result-pharmacy", medicine.pharmacy.name));
      li.appendChild(createSpan("result-location", medicine.pharmacy.location));
      list.appendChild(li);
    }
  } catch (error) {
    console.error(error);
    showMessage("Something went wrong. Please try again.");
  }
}

// Run a search when the form is submitted
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const medicineName = input.value.trim();
  searchMedicines(medicineName);
});

// Clear results when the input is emptied
input.addEventListener("input", () => {
  if (input.value.trim() === "") {
    list.innerHTML = "";
  }
});
