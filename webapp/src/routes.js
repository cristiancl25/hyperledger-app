import Productos from './components/productos/Productos';
import AllProductos from './components/productos/AllProductos';
import Producto from './components/productos/Producto';
import participantes from './components/participantes/participantes';
import participante from './components/participantes/participante';
import organizaciones from './components/organizaciones/organizaciones';
import AllOrganizaciones from './components/organizaciones/AllOrganizaciones';
import organizacion from './components/organizaciones/organizacion';
import HomePage from './components/HomePage';

export const routes = [
  { path: '', component: HomePage },
  { path: '/productos', component: Productos, children: [
      { path: '', component: AllProductos },
      { path: ':id/', component: Producto }]
  },
  { path: '/participantes', component: participantes, children: [
    { path: '', component: participantes },
    { path: ':rol/:id/', component: participante }]
  },
  { path: '/organizaciones', component: organizaciones, children: [
    { path: '', component: AllOrganizaciones },
    { path: ':id/', component: organizacion }]
  },
  { path: '*', redirect: '/'}
];
