import { Component, OnInit } from '@angular/core';
import { AiService } from '../ai.service';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
@Component({
  selector: 'app-home-component',
  templateUrl: './home-component.component.html',
  styleUrls: ['./home-component.component.scss']
})
export class HomeComponentComponent implements OnInit {
  email;
  constructor(private aiService: AiService, private router: Router, ) { }

  ngOnInit() {
    this.email = this.aiService.getEmail();
  }

  navigateToQuery() {
    this.aiService.setEmail(this.email);
    this.router.navigate(['/query']);
  }
}
