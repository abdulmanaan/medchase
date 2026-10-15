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

    // One list item per medicine
    for (const medicine of data.medicines) {
      const li = document.createElement("li");
      li.textContent = medicine.name;
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
