const form = document.getElementById("pharmacy-form");
const list = document.getElementById("pharmacy-list");
const nameInput = document.getElementById("pharmacy-name");
const locationInput = document.getElementById("pharmacy-location");
const errorMessage = document.getElementById("form-message");

// Show a single message inside the pharmacy list
function showMessage(text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}

// Create a link with text
function createLink(href, text) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = text;
  return a;
}

// Create a span with a class and text
function createSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

// Load all pharmacies
async function loadPharmacies() {
  list.innerHTML = "";

  try {
    // Ask the API
    const response = await fetch("/api/pharmacies");
    if (!response.ok) {
      return showMessage("Something went wrong. Please try again.");
    }
    const pharmacies = await response.json();

    // No pharmacies yet
    if (pharmacies.length === 0) {
      return showMessage("No pharmacies yet");
    }

    // One list item per pharmacy, linking to its stock page
    for (const pharmacy of pharmacies) {
      const li = document.createElement("li");
      li.appendChild(
        createLink("/pharmacy.html?id=" + pharmacy._id, pharmacy.name),
      );
      li.appendChild(createSpan("pharmacy-location", pharmacy.location));
      list.appendChild(li);
    }
  } catch (error) {
    console.error(error);
    showMessage("Something went wrong. Please try again.");
  }
}

loadPharmacies();

// Register a new pharmacy
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pharmacyName = nameInput.value.trim();
  const pharmacyLocation = locationInput.value.trim();

  try {
    // Send it to the API
    const response = await fetch("/api/pharmacies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pharmacyName, location: pharmacyLocation }),
    });
    if (!response.ok) {
      const data = await response.json();
      errorMessage.textContent = data.message;
      return;
    }

    // Success: clear the form and refresh the list
    form.reset();
    errorMessage.textContent = "";
    loadPharmacies();
  } catch (error) {
    console.error(error);
    errorMessage.textContent = "Something went wrong. Please try again.";
  }
});
