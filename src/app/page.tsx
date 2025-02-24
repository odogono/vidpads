import 'server-only';

import { LandingPage as LandingPageComponent } from '@components/LandingPage';
import { Body } from '@page/body';
import { generateMetadata } from '@page/metadata';

// eslint-disable-next-line react-refresh/only-export-components
export { generateMetadata };

export default function LandingPage() {
  return (
    <Body>
      <LandingPageComponent />
    </Body>
  );
}
