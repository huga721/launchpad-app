import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {loggingInterceptor} from "./interceptor/logging/logging.interceptor";
import {headersInterceptor} from "./interceptor/headers/headers.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loggingInterceptor, headersInterceptor])
    ),
    ]
};
