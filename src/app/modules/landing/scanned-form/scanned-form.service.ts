import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { Observable, map } from 'rxjs';

// declare var cv: any; // OpenCV's cv object
@Injectable({ providedIn: 'root' })
export class OCRService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    postOCR(
        type:
            | 'ikad_student'
            | 'ikad_employee'
            | 'mytentera'
            | 'mykad'
            | 'passport'
            | 'ocr',
        formData: FormData
    ): Observable<any> {
        let ekycUrl = 'https://kyc.e-kedai.my';
        let accessKey =
            '205828971096c23669005fc9b7b69994997ca18ac0c4f5947dd4b9cce4d33c63';

        const header = {
            headers: new HttpHeaders().set('Authorization', `${accessKey}`),

            params: {
                kyc_type: type,
            },
        };

        // Delete empty value
        Object.keys(header.params).forEach((key) => {
            if (Array.isArray(header.params[key])) {
                header.params[key] = header.params[key].filter(
                    (element) => element !== null
                );
            }
            if (
                header.params[key] === null ||
                (header.params[key].constructor === Array &&
                    header.params[key].length === 0)
            ) {
                delete header.params[key];
            }
        });

        return this._httpClient
            .post<any>(ekycUrl + '/kyc/', formData, header)
            .pipe(
                map((response) => {
                    // let result = information.responses[0];
                    return response;
                })
            );
    }
}
