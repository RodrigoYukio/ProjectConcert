import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export const bootstrap = () => {
  return bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
};

export default bootstrap;
