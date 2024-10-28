import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

    constructor(){}

    // -----------------------------------------------------------------------------------------------------
    // @ Registration Information
    // -----------------------------------------------------------------------------------------------------
    
    //User Type
    private userType: string; //Declare
    setUserType(type: string) { this.userType = type; } //Set
    getUserType() { return this.userType; } //Get

    //Card Image - base64 image
    private idImage: string; //Declare
    setIdImage(image: string) { this.idImage = image; } //Set
    getIdImage() { return this.idImage; } //Get
    
    //User Fullname
    private userName: string; //Declare
    setUserName(type:string) {this.userName = type; } //Set
    getUserName() { return this.userName; } //Get
    
    //ID Type
    private idType: string;
    setIdType(type: string) { this.idType = type; } //Set
    getIdType() { return this.idType; } //Get`
    
    //ID Number
    private idNumber: string;
    setIdNumber(type: string) { this.idNumber = type; } //Set
    getIdNumber() { return this.idNumber; } //Get
    
    //Birth Date
    private dateBirth: Date;
    setDateBirth(type: Date) { this.dateBirth = type; } //Set
    getDateBirth() { return this.dateBirth; } //Get
    
    //Nationality
    private nationality: string;
    setNationality(type: string) { this.nationality = type; } //Set
    getNationality() { return this.nationality; } //Get
    
    //User Address
    private address: string;
    setAddress(type: string) { this.address = type; } //Set
    getAddress() { return this.address; } //Get
    
    //Address City
    private city: string;
    setCity(type: string) { this.city = type; } //Set
    getCity() {return this.city; } //Get
    
    //Address Postcode
    private postcode: string;
    setPostCode(type: string) { this.postcode = type;} //Set
    getPostCode() { return this.postcode; } //Get
    
    //Address State
    private state: string;
    setState(type: string) { this.state = type;} //Set
    getState() { return this.state; } //Get
    
    //Alternate Contact Number
    private contact: string;
    setContact(type: string) { this.contact = type;} //Set
    getContact() { return this.contact; } //Get

    // -----------------------------------------------------------------------------------------------------
    // @ Facial Verification Information
    // -----------------------------------------------------------------------------------------------------

    //Face Comparison Data - base64 image
    private faceCompare: string;
    setFaceCompare(type: string) {this.faceCompare = type; } //Set
    getFaceCompare() { return this.faceCompare; } //Get

    // + + +

    // -----------------------------------------------------------------------------------------------------
    // @ Foreigner Supporting Document
    // -----------------------------------------------------------------------------------------------------

    //Foreign Supporting Document 1 - base64 image
    private docImage1: string; //Declare
    setImageDoc1(type: string) { this.docImage1 = type; } //Set
    getImageDoc1() { return this.docImage1; } //Get

    //Foreign Supporting Document 2 - base64 image
    private docImage2: string; //Declare
    setImageDoc2(type: string) { this.docImage2 = type; } //Set
    getImageDoc2() { return this.docImage2; } //Get

    //Foreign Supporting Document 3 - base64 image
    private docImage3: string; //Declare
    setImageDoc3(type: string) { this.docImage3 = type; } //Set
    getImageDoc3() { return this.docImage3; } //Get

    // + + +
    
}