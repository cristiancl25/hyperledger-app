import Peixes from './components/peixe/Peixes';
import AllPeixes from './components/peixe/AllPeixes';
import Peixe from './components/peixe/Peixe';
import HomePage from './components/HomePage';

export const routes = [
  { path: '', component: HomePage},
  {path: '/peixe', component: Peixes, children: [
      { path: '', component: AllPeixes },
      { path: ':id/', component: Peixe },
    ] }
];
