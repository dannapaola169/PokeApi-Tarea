const API_URL = "https://pokeapi.co/api/v2";
let currentPage = 1;
let pokemonType = "";
let totalPages = 1;

/**Buscar por nombre */
function buscarPokemon() {
  const name = document.getElementById("pokemonName").value.toLowerCase();
  if (name) {
    fetch(`${API_URL}/pokemon/${name}`)
      .then((response) => response.json())
      .then((pokemon) => mostrarPokemon([pokemon]))
      .catch((error) => alert("Pokemon no encontrado, escríbalo correctamente"));
  }
}

/**para las paginas */
function tipoPokemon(type, page = 1) {
  currentPage = page;
  pokemonType = type;

  fetch(`${API_URL}/type/${type}`)
    .then((response) => response.json())
    .then((data) => {
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedPokemon = data.pokemon.slice(startIndex, endIndex);

      totalPages = Math.ceil(data.pokemon.length / 20);

      const promises = paginatedPokemon.map((p) =>
        fetch(p.pokemon.url).then((res) => res.json())
      );
      Promise.all(promises).then((pokemonList) => {
        mostrarPokemon(pokemonList);
        actPaginacion();
      });
    })
    .catch((error) => console.error(error));
}

/**mostrar en la pagina */
function mostrarPokemon(pokemonList) {
  const pokemonListDiv = document.getElementById("pokemonList");
  pokemonListDiv.innerHTML = "";

  pokemonList.forEach((pokemon) => {
    const pokemonDiv = document.createElement("div");
    pokemonDiv.className = "pokemon-item";

    const pokemonName = document.createElement("h3");
    pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const pokemonImg = document.createElement("img");
    pokemonImg.src = pokemon.sprites.front_default;

    pokemonDiv.appendChild(pokemonName);
    pokemonDiv.appendChild(pokemonImg);

    pokemonListDiv.appendChild(pokemonDiv);
  });
}

/**actualizar la paginacion */
function actPaginacion() {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";


/**botones de navegacion y pagina actual */
  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.textContent = "Anterior";
    prevButton.onclick = () => tipoPokemon(pokemonType, currentPage - 1);
    paginationDiv.appendChild(prevButton);
  }
  const pageInfo = document.createElement("span");
  pageInfo.textContent = ` Página ${currentPage} de ${totalPages} `;
  paginationDiv.appendChild(pageInfo);
  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "Siguiente";
    nextButton.onclick = () => tipoPokemon(pokemonType, currentPage + 1);
    paginationDiv.appendChild(nextButton);
  }
}
