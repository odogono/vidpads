import { useEffect, useRef, useState } from 'react';

import { Main } from '@components/Main';
import { StoreProvider } from '@model/store/provider';

const App = () => {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};

export default App;
