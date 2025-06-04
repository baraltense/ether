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
        calcular();
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
    let impuestoPorcentaje = parseFloat(document.getElementById('impuesto').value) || 2; // 2% por defecto

    // Calcular el impuesto por ether (redondeando hacia abajo al número entero más cercano)
    let impuestoPorEther = Math.floor(precioEther * impuestoPorcentaje / 100);
    
    // Precio neto por ether después de impuestos
    let precioNetoEther = precioEther - impuestoPorEther;
    
    // Ganancia por unidad: (precio neto de los éteres * multiplicador) - precio del bracelet
    let gananciaPorUnidad = (precioNetoEther * multiplicador) - precioBracelet;
    
    // Ganancia total
    let gananciaTotal = gananciaPorUnidad * cantidad;
    
    // Inversión total
    let inversionCompra = precioBracelet * cantidad;

    // Actualizar resultados
    const invCompraElement = document.getElementById('invCompra');
    const gananciaTotalElement = document.getElementById('gananciaTotal');
    
    invCompraElement.innerText = inversionCompra.toLocaleString('es-ES');
    gananciaTotalElement.innerText = gananciaTotal.toLocaleString('es-ES');
    
    // Aplicar clases según sea positivo o negativo
    gananciaTotalElement.className = 'compact-result';
    if (gananciaTotal >= 0) {
        gananciaTotalElement.classList.add('positive');
    } else {
        gananciaTotalElement.classList.add('negative');
    }
}

function resetearValores() {
    location.reload();
}

document.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        calcular();
    }
});
