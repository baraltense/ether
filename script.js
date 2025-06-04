const items = [
    { id: '21817' }, // Bracelet of ethereum (uncharged)
    { id: '21820' }, // Bracelet of ethereum
    { id: '24777' }, // Ether
    { id: '13190' }, // Ring of wealth
    { id: '20997' }, // Amulet of glory
    { id: '22486' }, // Amulet of fury
    { id: '27277' }, // Zaryte vambraces
    { id: '4714' },  // Berserker necklace
];

let precios = {};

async function obtenerPrecios() {
    try {
        const [preciosResponse, mappingResponse] = await Promise.all([
            fetch('https://prices.runescape.wiki/api/v1/osrs/latest'),
            fetch('https://prices.runescape.wiki/api/v1/osrs/mapping')
        ]);

        const [preciosData, mappingData] = await Promise.all([
            preciosResponse.json(),
            mappingResponse.json()
        ]);

        items.forEach(item => {
            const id = item.id;
            const precio = preciosData.data[id];
            const mappingItem = mappingData.find(mapped => mapped.id == id);

            if (precio && mappingItem) {
                precios[id] = {
                    nombre: mappingItem.name || 'Desconocido',
                    icono: mappingItem.icon || 'default_icon.png',
                    bajo: precio.low || 0,
                    alto: precio.high || 0,
                    lowTime: precio.lowTime || '',
                    highTime: precio.highTime || '',
                };
            }
        });

        llenarListaItems();
        actualizarInputs();
        calcular(); // Calcular automáticamente al cargar precios
    } catch (error) {
        console.error('Error al obtener los precios:', error);
        document.getElementById('itemsList').innerHTML = 
            '<li style="text-align: center; color: var(--primary-color);">Error cargando datos</li>';
    }
}

function llenarListaItems() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';
    
    items.forEach(item => {
        const id = item.id;
        const precioItem = precios[id];
        const nombre = precioItem?.nombre || 'Desconocido';
        const icono = precioItem?.icono ? 
            `https://oldschool.runescape.wiki/images/${formatearNombreItem(nombre)}_detail.png` : 
            'https://oldschool.runescape.wiki/images/default_icon.png';

        const listItem = document.createElement('li');
        listItem.className = 'compact-item';
        listItem.innerHTML = `
            <img src="${icono}" alt="${nombre}" class="compact-icon" onerror="this.src='https://oldschool.runescape.wiki/images/default_icon.png'">
            <div class="compact-item-info">
                <div class="compact-item-name">${nombre}</div>
                <div class="compact-item-price">
                    <span>B: <span class="compact-price-value">${precioItem?.bajo?.toLocaleString('es-ES') || 'N/A'}</span>
                    <small>${precioItem?.lowTime ? formatTime(precioItem.lowTime) : ''}</small></span>
                    <span>A: <span class="compact-price-value">${precioItem?.alto?.toLocaleString('es-ES') || 'N/A'}</span>
                    <small>${precioItem?.highTime ? formatTime(precioItem.highTime) : ''}</small></span>
                </div>
            </div>
        `;
        list.appendChild(listItem);
    });
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatearNombreItem(nombre) {
    return nombre
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/^\w/, c => c.toUpperCase());
}

function actualizarInputs() {
    const precioBajoEther = precios['21817']?.bajo || 0; // Uncharged bracelet
    const precioAltoEther = precios['21820']?.alto || 0; // Charged bracelet
    document.getElementById('precioBracelet').value = precioBajoEther;
    document.getElementById('precioEther').value = precioAltoEther;
}

function calcular() {
    // Obtener valores de los inputs
    const precioBracelet = parseFloat(document.getElementById('precioBracelet').value) || 0;
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 10000;
    const precioEther = parseFloat(document.getElementById('precioEther').value) || 0;
    const multiplicador = parseFloat(document.getElementById('multiplicador').value) || 250;
    const impuestoPorcentaje = parseFloat(document.getElementById('impuesto').value) || 2;

    // Cálculos precisos según mecánicas de OSRS
    const impuestoPorEther = Math.floor(precioEther * impuestoPorcentaje / 100);
    const precioNetoEther = precioEther - impuestoPorEther;
    const gananciaPorUnidad = (precioNetoEther * multiplicador) - precioBracelet;
    const gananciaTotal = gananciaPorUnidad * cantidad;
    const inversionCompra = precioBracelet * cantidad;

    // Actualizar la interfaz
    document.getElementById('invCompra').innerText = inversionCompra.toLocaleString('es-ES');
    const gananciaElement = document.getElementById('gananciaTotal');
    gananciaElement.innerText = Math.round(gananciaTotal).toLocaleString('es-ES');
    
    // Estilo según ganancia positiva/negativa
    gananciaElement.className = gananciaTotal >= 0 ? 'compact-result positive' : 'compact-result negative';
}

function resetearValores() {
    document.getElementById('precioBracelet').value = precios['21817']?.bajo || 0;
    document.getElementById('cantidad').value = 10000;
    document.getElementById('precioEther').value = precios['21820']?.alto || 0;
    document.getElementById('multiplicador').value = 250;
    document.getElementById('impuesto').value = 2;
    calcular();
}

// Event listeners
document.addEventListener("DOMContentLoaded", obtenerPrecios);
document.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        calcular();
    }
});
