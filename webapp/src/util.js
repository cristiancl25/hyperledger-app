export const util = {
    colorEstadoProducto(estado){
        switch (estado) {
            case 'PARADO':
              return 'badge badge-secondary';
            case 'VENTA':
              return 'badge badge-info';
            case 'TRANSACCION':
              return 'badge badge-primary';
            case 'PUJA':
              return 'badge badge-light';
            case 'CONSUMIDO':
              return 'badge badge-success';
            case 'PERDIDO':
              return 'badge badge-danger';
            case 'DIVIDIDO':
              return 'badge badge-warning';
        }
    }
}