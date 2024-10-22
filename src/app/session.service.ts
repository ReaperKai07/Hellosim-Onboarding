import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

    constructor() {}

    //UserType
    private userType: string; //Declare
    setUserType(type: string) { this.userType = type; } //Set
    getUserType() { return this.userType; } //Get

    //Foreign Supporting Document 1
    private docImage1: string; //Declare
    setImageDoc1(type: string) { this.docImage1 = type; } //Set
    getImageDoc1() { return this.docImage1; } //Get

    //Foreign Supporting Document 2
    private docImage2: string; //Declare
    setImageDoc2(type: string) { this.docImage2 = type; } //Set
    getImageDoc2() { return this.docImage2; } //Get

    //Foreign Supporting Document 3
    private docImage3: string; //Declare
    setImageDoc3(type: string) { this.docImage3 = type; } //Set
    getImageDoc3() { return this.docImage3; } //Get

    
}