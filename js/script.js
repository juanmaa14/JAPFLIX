let movies = [];

  // Helper: devuelve un array de nombres de géneros (maneja strings u objetos)
  function getGenreNames(movie) {
    if (!movie || !Array.isArray(movie.genres)) return [];
    return movie.genres.map(g => {
      if (!g) return "";
      if (typeof g === "string") return g;
      if (typeof g === "object" && g.name) return g.name;
      return String(g);
    }).filter(Boolean);
  }

  // Convierte vote_average (0-10) a 5 estrellas
  function generarEstrellas(vote) {
    const estrellasTotales = 5;
    const estrellasLlenas = Math.round((vote || 0) / 2);
    let html = "";
    for (let i = 0; i < estrellasTotales; i++) {
      if (i < estrellasLlenas) {
        html += `<span class="fa fa-star checked text-warning"></span>`;
      } else {
        html += `<span class="fa fa-star text-secondary"></span>`;
      }
    }
    return html;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("https://japceibal.github.io/japflix_api/movies-data.json");
      movies = await response.json();
      console.log("Películas cargadas:", movies.length);
    } catch (error) {
      console.error("Error al cargar películas:", error);
      movies = [];
    }

    const btnBuscar = document.getElementById("btnBuscar");
    const inputBuscar = document.getElementById("inputBuscar");
    const lista = document.getElementById("lista");

    function realizarBusqueda() {
      const query = (inputBuscar.value || "").trim().toLowerCase();
      lista.innerHTML = "";

      if (query === "") return;

      const resultados = movies.filter(movie => {
        const title = (movie.title || "").toLowerCase();
        const overview = (movie.overview || "").toLowerCase();
        const tagline = (movie.tagline || "").toLowerCase();
        const genresText = getGenreNames(movie).join(", ").toLowerCase();

        return title.includes(query) ||
               genresText.includes(query) ||
               tagline.includes(query) ||
               overview.includes(query);
      });

      if (resultados.length === 0) {
        lista.innerHTML = `<li class="list-group-item bg-dark text-light">No se encontraron resultados</li>`;
        return;
      }

      resultados.forEach(movie => {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "bg-dark", "text-light", "list-group-item-action");
        li.style.cursor = "pointer";

        const estrellas = generarEstrellas(movie.vote_average);

        li.innerHTML = `
          <h5 class="mb-1">${movie.title}</h5>
          <p class="fst-italic mb-1">${movie.tagline || "Sin tagline"}</p>
          <p class="mb-0">${estrellas}</p>
        `;

        // Click para abrir offcanvas con detalle completo
        li.addEventListener("click", () => {
          // Título y overview
          document.getElementById("movieDetailLabel").textContent = movie.title || "Sin título";
          document.getElementById("movieOverview").textContent = movie.overview || "Sin descripción";

          // Géneros como badges
          const genresList = document.getElementById("movieGenres");
          genresList.innerHTML = "";
          getGenreNames(movie).forEach(genreName => {
            const liGenre = document.createElement("li");
            liGenre.classList.add("list-inline-item", "badge", "bg-primary", "me-1");
            liGenre.textContent = genreName;
            genresList.appendChild(liGenre);
          });

          // Dropdown con Year, Runtime y Budget
          const extraList = document.getElementById("movieExtra");
          extraList.innerHTML = `
            <li><span class="dropdown-item">Year: ${movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</span></li>
            <li><span class="dropdown-item">Runtime: ${movie.runtime ? movie.runtime + " min" : "N/A"}</span></li>
            <li><span class="dropdown-item">Budget: ${movie.budget ? "$" + movie.budget.toLocaleString() : "N/A"}</span></li>
            <li><span class="dropdown-item">Revenue: ${movie.revenue ? "$" + movie.revenue.toLocaleString() : "N/A"}</span></li>
          `;

          // Mostrar offcanvas
          const offcanvasEl = document.getElementById("movieDetail");
          const offcanvas = new bootstrap.Offcanvas(offcanvasEl);
          offcanvas.show();
        });

        lista.appendChild(li);
      });
    }

    // Eventos: click en botón y Enter en input
    btnBuscar.addEventListener("click", realizarBusqueda);
    inputBuscar.addEventListener("keyup", (e) => {
      if (e.key === "Enter") realizarBusqueda();
    });
  });