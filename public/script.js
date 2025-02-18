document.addEventListener("DOMContentLoaded", () => {
    // Variables para la paginación
    let currentPage = 1;
    let productsPerPage = 4;
    let allProducts = [];

    // Modo Oscuro
    const toggleButton = document.getElementById("darkModeToggle");
    const body = document.body;

    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark-mode");
        toggleButton.textContent = "☀️ Modo Claro";
    }

    toggleButton.addEventListener("click", function () {
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("dark-mode", "enabled");
            toggleButton.textContent = "☀️ Modo Claro";
        } else {
            localStorage.setItem("dark-mode", "disabled");
            toggleButton.textContent = "🌙 Modo Oscuro";
        }
    });
    //Rellenar ejemplo
    const boton2 = document.getElementById("boton2");
    function rellenar(){
        document.getElementById('url').value = "https://www.mantequeriaslatienda.com/";
        document.getElementById('containerClass').value = "product-item";
        document.getElementById('titleClass').value = "product-item-link";
        document.getElementById('priceClass').value = "price-box";
        document.getElementById('imageClass').value = "product-image-photo";

    }
    boton2.addEventListener("click",rellenar);
    // Mostrar/Ocultar Formulario
    const toggleForm = document.getElementById("toggleForm");
    const formContainer = document.getElementById("formContainer");
    const cerrar = document.getElementById("cerrar");

    toggleForm.addEventListener("click", () => {
        formContainer.classList.toggle("hidden");
    });

    cerrar.addEventListener("click", () => {
        formContainer.classList.add("hidden");
    });

    // Scraping de Productos
    document.getElementById('scraperForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const url = document.getElementById('url').value;
        const containerClass = document.getElementById('containerClass').value;
        const titleClass = document.getElementById('titleClass').value;
        const priceClass = document.getElementById('priceClass').value;
        const imageClass = document.getElementById('imageClass').value;

        const productsContainer = document.getElementById('productsContainer');
        const paginationControls = document.getElementById('paginationControls');
        const loadingDiv = document.getElementById('loading');

        // Animacion de carga

        function animateDots() {
            const dots = document.getElementById("dots");
            let count = 0;
            setInterval(() => {
                count = (count + 1) % 4;
                dots.innerHTML = ".".repeat(count);
            }, 500);
        }


        // Mostrar spinner de carga
        loadingDiv.style.display = 'block';


        productsContainer.innerHTML = ''; // Limpiar contenedor
        paginationControls.classList.add('hidden'); // Ocultar controles de paginación

        try {

            animateDots();
            const response = await fetch('/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    containerClass,
                    titleClass,
                    priceClass,
                    imageClass,
                }),
            });

            const data = await response.json();

            if (data.products && data.products.length > 0) {
                allProducts = data.products; // Guardar todos los productos
                currentPage = 1; // Reiniciar la página actual
                renderProducts(); // Mostrar la primera página
                updatePaginationControls(); // Actualizar controles de paginación
                paginationControls.classList.remove('hidden'); // Mostrar controles de paginación
            } else {
                const noProductsMessage = document.createElement('p');
                noProductsMessage.textContent = 'No se encontraron productos.';
                productsContainer.appendChild(noProductsMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Hubo un error al obtener los productos.';
            errorMessage.style.color = 'red';
            productsContainer.appendChild(errorMessage);
        } finally {
            // Ocultar spinner de carga
            loadingDiv.style.display = 'none';
        }
    });

    // Función para renderizar los productos de la página actual
    function renderProducts() {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = ''; // Limpiar contenedor

        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = allProducts.slice(startIndex, endIndex);

        productsToShow.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';

            const productTitle = document.createElement('h2');
            productTitle.textContent = product.title;

            const productPrice = document.createElement('p');
            productPrice.textContent = `Precio: ${product.price}`;

            const productImage = document.createElement('img');
            productImage.src = product.image;
            productImage.alt = product.title;

            productDiv.appendChild(productImage);
            productDiv.appendChild(productTitle);
            productDiv.appendChild(productPrice);

            productsContainer.appendChild(productDiv);
        });
    }

    // Función para actualizar los controles de paginación
    function updatePaginationControls() {
        const pageInfo = document.getElementById('pageInfo');
        const totalPages = Math.ceil(allProducts.length / productsPerPage);

        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    // Eventos para los botones de paginación
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
            updatePaginationControls();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
            updatePaginationControls();
        }
    });

    async function obtenerNoticiasDesdeRSS(url) {
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const respuesta = await fetch(proxyUrl);
            const data = await respuesta.json();
    
            if (!data.contents) {
                throw new Error("No se pudo obtener el contenido RSS.");
            }
    
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
    
            const items = xml.querySelectorAll("item");
            const noticias = [];
    
            items.forEach(item => {
                const titulo = item.querySelector("title")?.textContent || "Sin título";
                const descripcion = item.querySelector("description")?.textContent || "Sin descripción";
                
                // Intentamos obtener la imagen de <media:content>
                let imagen = "";
                const mediaContent = item.getElementsByTagName("media:content");
                if (mediaContent.length > 0) {
                    imagen = mediaContent[0].getAttribute("url") || "";
                }
    
                noticias.push({ titulo, imagen, descripcion });
            });
    
            return noticias;
        } catch (error) {
            console.error("Error al obtener el RSS:", error);
            return [];
        }
    }
    
    function mostrarNoticias(noticias) {
        const contenedor = document.getElementById("rssNoticias");
        if (!contenedor) {
            console.error("Error: No se encontró el elemento con ID 'rssNoticias'");
            return;
        }
    
        contenedor.innerHTML = ""; // Limpiar el contenedor antes de añadir noticias
    
        let contador = 0;
    
        noticias.forEach(noticia => {
            // Filtrar noticias que no tengan título, imagen o descripción
            if (!noticia.titulo || !noticia.imagen || !noticia.descripcion) return;
    
            // Limitar a 10 noticias
            if (contador >= 10) return;
    
            const noticiaDiv = document.createElement("div");
            noticiaDiv.classList.add("noticia");
    
            noticiaDiv.innerHTML = `
                <h2>${noticia.titulo}</h2>
                <img src="${noticia.imagen}" alt="Imagen de noticia">
                <p>${noticia.descripcion}</p>
            `;
    
            contenedor.appendChild(noticiaDiv);
            contador++;
        });
    }
    
    
    
    // URL del RSS
    const urlRSS = "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada";
    obtenerNoticiasDesdeRSS(urlRSS).then(mostrarNoticias);
    
    
    
    // Función para cargar y mostrar las noticias desde el feed ATOM
async function cargarNoticias() {
    const feedUrl = 'https://www.abc.es/rss/atom/motor/';
    const container = document.getElementById('atomNoticias');

    try {
        // Usar un proxy para evitar problemas de CORS
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('No se pudo obtener el feed ATOM.');
        }

        const data = await response.json();

        // Verificar si el contenido está vacío o inválido
        if (!data.contents) {
            throw new Error('El feed ATOM está vacío o no es válido.');
        }

        // Parsear el contenido XML
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'application/xml');

        // Verificar si hay errores en el XML
        const parseError = xml.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            throw new Error('Error al analizar el feed ATOM.');
        }

        // Procesar las entradas del feed
        const entries = xml.querySelectorAll('entry');
        if (entries.length === 0) {
            container.innerHTML = '<p>No hay noticias disponibles.</p>';
            return;
        }

        let noticiasHTML = '';
        let contador = 0;
        entries.forEach(entry => {
            if (contador>=10) return;
            const title = entry.querySelector('title')?.textContent || 'Sin título';
            const link = entry.querySelector('link[rel="alternate"]')?.getAttribute('href') || '#';
            const summary = entry.querySelector('summary')?.textContent || 'Sin resumen';
            const published = entry.querySelector('updated')?.textContent || 'Fecha desconocida';

            noticiasHTML += `
                <div class="noticia">
                    <h3>${title}</h3>
                    <p><strong>Publicado:</strong> ${new Date(published).toLocaleDateString()}</p>
                    <p>${summary}</p>
                    <a href="${link}" target="_blank">Leer más</a>
                </div>
            `;
            contador++;
        });

        // Mostrar las noticias en el contenedor
        container.innerHTML = noticiasHTML;
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p>Error al cargar las noticias. Por favor, inténtalo más tarde.</p>';
    }
}

// Cargar las noticias cuando se cargue la página
window.addEventListener('DOMContentLoaded', cargarNoticias);
    
});