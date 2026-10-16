import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { MenuItem } from "./sweitemmenu.models";


@Injectable({
    providedIn: 'root',
})
export class SweItemMenuService {
    private http = inject(HttpClient);

    private endpoint = `${environment.urlApi}swe/menu`;

    getMenuItem(): Observable<MenuItem[]> {
        return this.http.get<MenuItem[]>(this.endpoint);
    }
}
