const API_URL = "https://pokeapi.co/api/v2";
let currentPage = 1;
let pokemonType = "";
let totalPages = 1;
let selectedTypes = [];

const traduccionesTipos = {
fire: "Fuego", water: "Agua", grass: "Planta", electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra",
flying: "Volador", psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma",  dragon: "Dragón",  dark: "Siniestro",  steel: "Acero",
fairy: "Hada", normal: "Normal",
}


/**Buscar por nombre */
function buscarPokemon() {
  const name = document.getElementById("pokemonName").value.toLowerCase();
  if (name) {
    fetch(`${API_URL}/pokemon?limit=1000`)
      .then(response => response.json())
      .then(data => {
        const pokemonList = data.results.filter(pokemon => pokemon.name.includes(name));
        const pokemonPromises = pokemonList.map(pokemon => fetch(pokemon.url).then(res => res.json()));

        return Promise.all(pokemonPromises);
      })
      .then(pokemon => mostrarPokemon(pokemon))
      .catch(error => alert("No se encontraron Pokémon que coincidan con la búsqueda."));
  }
}

/**para seleccionar hasta 2 tipos */
function seleccionarTipo(type, button) {
  if (selectedTypes.includes(type)) {
    selectedTypes = selectedTypes.filter(t => t !== type);
    button.classList.remove("selected");
  } else if (selectedTypes.length < 2) {
    selectedTypes.push(type);
    button.classList.add("selected");
  }

  if (selectedTypes.length > 0) {
    buscarPokemonPorTipos(selectedTypes);
  }
}

/**Buscar Pokémon por tipos */
function buscarPokemonPorTipos(types, page = 1) {
  currentPage = page;

  const typePromises = types.map(type => fetch(`${API_URL}/type/${type}`).then(res => res.json()));

  Promise.all(typePromises).then(data => {
    let pokemonList = data[0].pokemon.map(p => p.pokemon);

    if (types.length === 2) {
      const secondTypePokemon = data[1].pokemon.map(p => p.pokemon);
      pokemonList = pokemonList.filter(pokemon =>
        secondTypePokemon.some(secondTypeP => secondTypeP.name === pokemon.name)
      );
    }

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    const paginatedPokemon = pokemonList.slice(startIndex, endIndex);

    totalPages = Math.ceil(pokemonList.length / 20);

    const promises = paginatedPokemon.map(p => fetch(p.url).then(res => res.json()));
    Promise.all(promises).then(pokemonData => {
      mostrarPokemon(pokemonData);
      actPaginacion();
    });
  }).catch(error => console.error(error));
}

/**mostrar en la pagina */
function mostrarPokemon(pokemonList) {
  const pokemonListDiv = document.getElementById("pokemonList");
  pokemonListDiv.innerHTML = "";

  pokemonList.forEach((pokemon) => {
    const pokemonDiv = document.createElement("div");
    pokemonDiv.className = "pokemon-item";
    pokemonDiv.onclick = () => detallePokemon(pokemon);

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


/**mostrar detalles del pokemon */
function detallePokemon(pokemon) {
  const modal = document.getElementById("pokemonModal");
  const detailsDiv = document.getElementById("pokemonDetails");
  const tipos = pokemon.types.map(type => traduccionesTipos[type.type.name] || type.type.name).join(", ");
  const sprite = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default || pokemon.sprites.front_default;

  detailsDiv.innerHTML = `
    <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
    <img src="${sprite}" alt="${pokemon.name}">
    <p><strong>Tipos:</strong> ${tipos}</p>
    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
    <p><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(", ")}</p>
    <p><strong>Estadísticas:</strong></p>
    <ul>
      ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join("")}
    </ul>
  `;
  modal.style.display = "block";
}

function cerrarModal() {
  const modal = document.getElementById("pokemonModal");
  modal.style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("pokemonModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
