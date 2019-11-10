
import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import {ApiAiClient} from "api-ai-javascript";
import { Http , Response } from "@angular/http";
import { Observable } from 'rxjs';

const client = new ApiAiClient({accessToken: '5a9bcdf713c447f691a93b495fcc59d8'})

@Injectable()
export class AiService {
    chat = [];
    email = '';
    constructor(private http: Http) { }
    getChats(){
        return this.chat;
    }
    getEmail(){
        return this.email;
    }
    setEmail(email) {
        this.email = email
    }

    setChat(text){
        this.chat.push(text);
    }
    
    getAiService(query){
     return client.textRequest(query);
    }

}