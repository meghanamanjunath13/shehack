import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AiService } from './ai.service';
import { SpeechRecognitionService } from './speech.service';
import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';
import { FormsModule } from '@angular/forms';
// import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { HttpModule } from '@angular/http';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponentComponent } from './home-component/home-component.component';
import { HeaderComponent } from './header/header.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
// import {MatInputModule} from '@angular/material/input';
const routes: Routes = [
  { path: '', component: HomeComponentComponent },
  { path: 'home', component: HomeComponentComponent },
  { path: 'query', component: QueryComponent }
];
@NgModule({
  declarations: [
    AppComponent,
    QueryComponent,
    HomeComponentComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule, FormsModule, HttpModule, RouterModule.forRoot(routes, { useHash: true }), ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [AiService, SpeechRecognitionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
