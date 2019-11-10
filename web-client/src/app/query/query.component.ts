import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AiService } from '../ai.service';
import { SpeechRecognitionService } from '../speech.service';

import { Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})

export class QueryComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  showChat = true;
  query = "";
  chat = [];
  typing = false;
  showSearchButton: boolean;
  speechData: string;
  constructor(private speechRecognitionService: SpeechRecognitionService, public aiService: AiService) {
    this.showSearchButton = true;
    this.speechData = "";
    this.chat = this.aiService.getChats();
  }
  activateSpeechSearchMovie(): void {

    this.showSearchButton = false;

    this.speechRecognitionService.record()
      .subscribe(
        //listener
        (value) => {
          this.speechData = value;
          this.query = this.speechData;
          console.log(value);

        },
        //errror
        (err) => {
          console.log(err);
          // if (err.error == "no-speech") {
          //   console.log("--restatring service--");
          //   this.activateSpeechSearchMovie();
          // }
        },
        //completion
        // () => {
        //   this.showSearchButton = true;
        //   console.log("--complete--");
        //   this.activateSpeechSearchMovie();
        );
  }
  identifyText(event) {
    if (event == 13) {
      this.sendQuery();
    }
  }






  toggleChat() {
    this.showChat = !this.showChat;
  }
  prev(chat) {
    chat.selected -= 1;
    if (chat.selected < 0) {
      chat.selected = 0;
    }
  }
  next(chat) {
    chat.selected += 1;
    if (chat.selected >= chat.elements.length) {
      chat.selected = chat.elements.length - 1;
    }
    console.log(chat);
  }
  sendQuery() {
    this.aiService.setChat({ text: this.query, from: "user" });
    let toquery = this.query;
    this.query = "";
    this.typing = true;
    let newThis = this;
    setTimeout(function () {

      newThis.scrollToBottom();
    }, 100);
    this.aiService.getAiService(toquery).then(data => {
      console.log(data);

      this.query = "";
      this.chat = this.aiService.getChats();

      console.log(data);
      if (data.status.code == 200) {
        let resp = JSON.stringify(data);
        console.log(JSON.parse(resp));
        let respData = JSON.parse(resp);


        if (respData.result.fulfillment) {
          // let elements = respData.result.fulfillment.messages.split('\n');
          let texts = respData.result.fulfillment.speech.split('\n');
          for (let i = 0; i < texts.length; i++) {
            this.aiService.setChat({ text: texts[i], from: 'bot' });
          }
         
        } else {
          let texts = respData.result.fulfillment.speech.split('\n');
          for (let i = 0; i < texts.length; i++) {
            this.aiService.setChat({ text: texts[i], from: 'bot' });
          }

        }
        setTimeout(function () {

          newThis.scrollToBottom();
        }, 100);

      }
      this.typing = false;
    })
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  ngOnInit() {
    // this.aiService.setChat({ text: "Hello, Welcome to Gojek. How can I help you?", from: "bot" });
    this.aiService.getAiService('userId: ' + this.aiService.getEmail()).then(data => {
      console.log(data);
      if (data.status.code === 200) {
        let resp = JSON.stringify(data);
        console.log(JSON.parse(resp));
        let respData = JSON.parse(resp);
        if (respData.result.fulfillment) {
          let elements = respData.result.fulfillment.messages;
          this.aiService.setChat({ text: respData.result.fulfillment.speech, elements: elements, selected: 0, from: "bot" });
        } else {
          this.aiService.setChat({ text: respData.result.fulfillment.speech, from: "bot" });
        }
        setTimeout(() => {

          this.scrollToBottom();
        }, 100);
      }
    });
  }


  getSubTitle(type, string) {
    if (string) {
      const str = string.split(' | ');
      if (type === 'description') {
        return (str[0] === 'NA' ? '' : str[0]);
      } else if (type === 'fsp') {
        return +str[1];
      } else if (type === 'mrp') {
        return +str[2];
      }
    }
  }
}
