import {HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {Observable, tap} from "rxjs";

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("Outgoing HTTP request ", req)
  return next(req).pipe(
    tap(event => console.log("Incoming HTTP response ", event))
  );
};
