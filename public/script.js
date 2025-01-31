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

        // Mostrar spinner de carga
        loadingDiv.style.display = 'block';
        productsContainer.innerHTML = ''; // Limpiar contenedor
        paginationControls.classList.add('hidden'); // Ocultar controles de paginación

        try {
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
});