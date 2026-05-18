import { BrowserRouter, Route, Routes } from 'react-router';

import { LandingPage as LandingPageComponent } from '@components/LandingPage';
import { PagePlayer } from '@components/PagePlayer';
import { Body } from '@page/body';
import { DebugImportPage } from './routes/DebugImportPage';
import { PlayerLayout } from './routes/PlayerLayout';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <Body>
              <LandingPageComponent />
            </Body>
          }
        />
        <Route
          path='/player'
          element={
            <PlayerLayout>
              <PagePlayer />
            </PlayerLayout>
          }
        />
        <Route
          path='/debug_import'
          element={
            <Body>
              <DebugImportPage />
            </Body>
          }
        />
        <Route
          path='*'
          element={
            <Body>
              <main className='min-h-screen bg-page text-foreground flex items-center justify-center p-6'>
                <div className='text-center'>
                  <h1 className='text-2xl font-bold'>Page not found</h1>
                  <a className='mt-4 inline-block underline' href='/'>
                    Return to VO Pads
                  </a>
                </div>
              </main>
            </Body>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
