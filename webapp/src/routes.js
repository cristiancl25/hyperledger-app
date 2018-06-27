import Productos from './components/productos/Productos';
import AllProductos from './components/productos/AllProductos';
import Producto from './components/productos/Producto';
import HomePage from './components/HomePage';

export const routes = [
  { path: '', component: HomePage },
  { path: '/productos', component: Productos, children: [
      { path: '', component: AllProductos },
      { path: ':id/', component: Producto }]
  },
  { path: '*', redirect: '/'}
];
