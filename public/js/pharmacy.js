const form = document.getElementById("medicine-form");
const input = document.getElementById("medicine-name");
const list = document.getElementById("medicine-list");
const nameHeading = document.getElementById("pharmacy-name");
const locationText = document.getElementById("pharmacy-location");
const formMessage = document.getElementById("form-message");

// Read the pharmacy id from the URL (?id=...)
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Show a single message inside the medicine list
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

// Create a button that runs a function on click
function createButton(text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

// Delete a medicine after confirming
async function deleteMedicine(medicine) {
  if (!confirm("Delete " + medicine.name + "?")) {
    return;
  }

  try {
    const response = await fetch("/api/medicines/" + medicine._id, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      formMessage.textContent = data.message;
      return;
    }

    formMessage.textContent = "";
    loadPharmacy();
  } catch (error) {
    console.error(error);
    formMessage.textContent = "Something went wrong. Please try again.";
  }
}

// Rename a medicine
async function editMedicine(medicine) {
  const newName = prompt("New name", medicine.name)?.trim();

  // Cancelled, empty, or unchanged: do nothing
  if (!newName || newName === medicine.name) {
    return;
  }

  try {
    const response = await fetch("/api/medicines/" + medicine._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!response.ok) {
      const data = await response.json();
      formMessage.textContent = data.message;
      return;
    }

    formMessage.textContent = "";
    loadPharmacy();
  } catch (error) {
    console.error(error);
    formMessage.textContent = "Something went wrong. Please try again.";
  }
}

// Load the pharmacy and its medicines
async function loadPharmacy() {
  list.innerHTML = "";

  try {
    // Ask the API
    const response = await fetch("/api/pharmacies/" + id);
    if (!response.ok) {
      const data = await response.json();
      nameHeading.textContent = data.message;
      form.hidden = true;
      return;
    }
    const data = await response.json();

    // Fill in pharmacy details
    document.title = data.pharmacy.name;
    nameHeading.textContent = data.pharmacy.name;
    locationText.textContent = data.pharmacy.location;

    // No medicines yet
    if (data.medicines.length === 0) {
      return showMessage("No medicines yet");
    }

    // One list item per medicine, with Edit and Delete buttons
    for (const medicine of data.medicines) {
      const li = document.createElement("li");
      li.appendChild(createSpan("medicine-name", medicine.name));
      li.appendChild(createButton("Edit", () => editMedicine(medicine)));
      li.appendChild(createButton("Delete", () => deleteMedicine(medicine)));
      list.appendChild(li);
    }
  } catch (error) {
    console.error(error);
    nameHeading.textContent = "Something went wrong. Please try again.";
  }
}

// Load only if the URL has an id
if (!id) {
  nameHeading.textContent = "Pharmacy not found";
  form.hidden = true;
} else {
  loadPharmacy();
}

// Add a new medicine
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const medicineName = input.value.trim();

  try {
    // Send it to the API
    const response = await fetch("/api/pharmacies/" + id + "/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: medicineName }),
    });
    if (!response.ok) {
      const data = await response.json();
      formMessage.textContent = data.message;
      return;
    }

    // Success: clear the form and refresh the list
    form.reset();
    formMessage.textContent = "";
    loadPharmacy();
  } catch (error) {
    console.error(error);
    formMessage.textContent = "Something went wrong. Please try again.";
  }
});
