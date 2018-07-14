import Productos from './components/productos/Productos';
import ListaProductos from './components/productos/ListaProductos';
import CrearProducto from './components/productos/CrearProducto';
import Producto from './components/productos/Producto';
import transacciones from './components/transacciones/transacciones';
import organizaciones from './components/organizaciones/organizaciones';
import AllOrganizaciones from './components/organizaciones/listaOrganizaciones';
import organizacion from './components/organizaciones/organizacion';
import evento from './components/eventos/Evento';
import HomePage from './components/HomePage';

export const routes = [
  { path: '', component: HomePage },
  { path: '/productos', component: Productos, children: [
//      { path: '', component: AllProductos },
      { path: 'crear', component: CrearProducto },
      { path: 'all', component: ListaProductos },
      { path: ':id/', component: Producto }]
  },
  { path: '/transacciones', component: transacciones },
  { path: '/eventos', component: evento },
  { path: '/organizaciones', component: organizaciones, children: [
    { path: '', component: AllOrganizaciones },
    { path: ':id/', name: 'org', component: organizacion }]
  },
  { path: '*', redirect: '/'}
];
