import Router from '../Router.js';
import * as UserService from '../services/api/userService.js';
import * as Notification from '../services/notification.js';
import { checkInput } from '../utils/utils.js';

export class RegisterView {
	constructor() {
		this.template = 'register';
		this.UIelements = null;
	}

	async init() {
		const content = await Router.loadTemplate(this.template);
		document.getElementById('app').innerHTML = content;

		this.UIelements = this.getUIElements();
		this.addEventListeners();
	}

	update() {}

	getUIElements() {
		return {
			registrationForm: document.getElementById('registrationForm'),
			showLoginLink: document.getElementById('showLogin'),
			firstName: document.getElementById('first_name_registration'),
			lastName: document.getElementById('last_name_registration'),
			username: document.getElementById('username_registration'),
			email: document.getElementById('email_registration'),
			password: document.getElementById('password_registration'),
			registrationError: document.getElementById('registrationError')
		};
	}

	addEventListeners() {
		const inputs = [
			this.UIelements.firstName,
			this.UIelements.lastName,
			this.UIelements.username
		];
		
		inputs.forEach(input => {
			input.addEventListener('input', () => {
				input.value = checkInput(input);
			});
		});
		this.UIelements.registrationForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			await this.registerUser();
		});

		this.UIelements.showLoginLink.addEventListener('click', (e) => {
			e.preventDefault();
			window.history.pushState({}, "", "/");
			Router.handleLocationChange();
		});
	}

	async registerUser() {
		const userData = {
			first_name: this.UIelements.firstName.value,
			last_name: this.UIelements.lastName.value,
			username: this.UIelements.username.value,
			email: this.UIelements.email.value,
			password: this.UIelements.password.value
		};

		try {
			const response = await UserService.registerUser(userData);

			if (response.success) {
				Notification.showNotification(["Registration successful"]);
				window.history.pushState({}, "", "/");
				Router.handleLocationChange();
			} else {
				this.displayRegistrationError(response.error);
				this.displayRegistrationError(response.error);
			}
		} catch (error) {
			console.error('Failed to register', error);
			this.displayRegistrationError(error);
		}
	}

	displayRegistrationError(error) {
		const registrationError = this.UIelements.registrationError;
		registrationError.style.display = 'block';
		let errorMessages = [];

		if (error.message.includes("400")) {
			errorMessages.push(`Username already taken.`);
		} else {
			errorMessages.push(`Something went wrong.`);
		}
		errorMessages.push(`Please try again.`);

		registrationError.innerHTML = errorMessages.join('<br>');
		Notification.showErrorNotification(["Registration failed"]);
	}

}
