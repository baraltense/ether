const items = [
    { id: '21817' },
    { id: '21820' },
    { id: '24777' },
    { id: '13190' },
    { id: '20997' },
    { id: '22486' },
    { id: '27277' },
    { id: '4714' },
];

let precios = {};

async function obtenerPrecios() {
    try {
        const preciosResponse = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest');
        const preciosData = await preciosResponse.json();

        const mappingResponse = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping');
        const mappingData = await mappingResponse.json();

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
                    lowtime: precio.lowTime || '',
                    hightime: precio.highTime || '',
                };
            }
        });

        llenarListaItems();
        actualizarInputs();
        calcular();
    } catch (error) {
        console.error('Error al obtener los precios:', error);
    }
}

function llenarListaItems() {
    const list = document.getElementById('itemsList');
    items.forEach(item => {
        const id = item.id;
        const nombre = precios[id]?.nombre;
        const icono = precios[id]?.icono ? `https://oldschool.runescape.wiki/images/${formatearNombreItem(nombre)}_detail.png` : 'https://oldschool.runescape.wiki/images/default_icon.png';

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="${icono}" alt="${nombre}">
            <span class="item-name">${nombre}</span>
            <span class="item-price">
                <span>Bajo: ${precios[id]?.bajo.toLocaleString('es-ES') || 'N/A'}</span> (${formatTime(precios[id]?.lowtime)}) | 
                <span>Alto: ${precios[id]?.alto.toLocaleString('es-ES') || 'N/A'}</span> (${formatTime(precios[id]?.hightime)})
            </span>
        `;
        list.appendChild(listItem);
    });
}

function formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}

function formatearNombreItem(nombre) {
    return nombre
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/^\w/, c => c.toUpperCase());
}

function actualizarInputs() {
    const precioBajoEther = precios['21817']?.bajo || 0;
    const precioAltoEther = precios['21820']?.alto || 0;
    document.getElementById('precioBracelet').value = precioBajoEther;
    document.getElementById('precioEther').value = precioAltoEther;
}

function calcular() {
    let precioBracelet = parseFloat(document.getElementById('precioBracelet').value) || 0;
    let cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    let precioEther = parseFloat(document.getElementById('precioEther').value) || 0;
    let multiplicador = parseFloat(document.getElementById('multiplicador').value) || 1;
    let impuesto = parseFloat(document.getElementById('impuesto').value) / 100 || 0;

    let inversionCompra = precioBracelet * cantidad;
    let gananciaPorUnidad = ((precioEther * multiplicador) * (1 - impuesto)) - precioBracelet;
    let gananciaTotal = gananciaPorUnidad * cantidad;

    document.getElementById('invCompra').innerText = inversionCompra.toLocaleString('es-ES');
    document.getElementById('gananciaTotal').innerText = gananciaTotal.toLocaleString('es-ES');
}

function resetearValores() {
    // Recargar la página para restablecer todos los valores
    location.reload();
}


document.addEventListener("keypress", function(event) {
    if (event.key ==="Enter") {
        calcular();
    }
});
