document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://www.raydelto.org/agenda.php";

  const contactForm = document.getElementById("contactForm");
  const contactsList = document.getElementById("contactsList");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const closeMenu = document.getElementById("closeMenu");
  const overlay = document.getElementById("overlay");
  const menuItems = document.querySelectorAll(".menu-item");
  const pages = document.querySelectorAll(".page");
  const addContactFab = document.getElementById("addContactFab");

  let currentPage = "contacts";

  loadContacts();

  contactForm.addEventListener("submit", addContact);
  menuToggle.addEventListener("click", toggleSidebar);
  closeMenu.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const route = item.getAttribute("data-route");
      navigateTo(route);
      closeSidebar();
    });
  });

  addContactFab.addEventListener("click", () => {
    navigateTo("add-contact");
  });

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }

  function navigateTo(route) {
    currentPage = route;

    pages.forEach((page) => {
      page.classList.add("hidden");
    });

    document.getElementById(`${route}-page`).classList.remove("hidden");

    menuItems.forEach((item) => {
      if (item.getAttribute("data-route") === route) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    if (route === "contacts") {
      addContactFab.style.display = "flex";
    } else {
      addContactFab.style.display = "none";
    }
  }

  async function loadContacts() {
    try {
      contactsList.innerHTML = '<p class="loading">Cargando contactos...</p>';

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const contacts = await response.json();

      contactsList.innerHTML = "";

      if (contacts.length === 0) {
        contactsList.innerHTML = "<p>No hay contactos registrados.</p>";
        return;
      }

      contacts.sort((a, b) => {
        if (a.apellido !== b.apellido) {
          return a.apellido.localeCompare(b.apellido);
        }
        return a.nombre.localeCompare(b.nombre);
      });

      contacts.forEach((contact) => {
        displayContact(contact);
      });
    } catch (error) {
      console.error("Error al cargar los contactos:", error);
      contactsList.innerHTML = `<p class="error">Error al cargar los contactos: ${error.message}</p>`;
    }
  }

  async function addContact(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    if (!nombre || !apellido || !telefono) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Guardando...";
    submitButton.disabled = true;

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("telefono", telefono);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      alert("Contacto agregado correctamente.");

      contactForm.reset();
      navigateTo("contacts");
      loadContacts();
    } catch (error) {
      console.error("Error al agregar el contacto:", error);
      alert(`Error al agregar el contacto: ${error.message}`);
    } finally {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }

  function displayContact(contact) {
    const contactCard = document.createElement("div");
    contactCard.className = "contact-card";

    contactCard.innerHTML = `
            <div class="contact-name">${contact.nombre} ${contact.apellido}</div>
            <div class="contact-phone">${contact.telefono}</div>
        `;

    contactsList.appendChild(contactCard);
  }
});
