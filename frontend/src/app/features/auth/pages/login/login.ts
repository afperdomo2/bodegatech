import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bt-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;

  onSubmit() {
    console.log('Login:', { email: this.email, password: this.password });
  }

  onForgotPassword() {
    console.log('Forgot password');
  }
}
