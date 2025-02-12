import * as API from './api.js';
import * as Cookies from '../cookies.js';
import * as Notification from '../notification.js';

export async function loginUser(username, password) {
	try {
		const data = await API.fetchWithoutAuth(`${API.API_BASE_URL}/users/login/`, {
			method: 'POST',
			body: JSON.stringify({ username, password }),
		});
		return { success: true, data };
	} catch (error) {
		console.error('Login error:', error);
		return { success: false, error };
	}
}

export async function registerUser(userData) {
	try {
		const data = await API.fetchWithoutAuth(`${API.API_BASE_URL}/users/create/`, {
			method: 'POST',
			body: JSON.stringify(userData)
		});
		return { success: true, data };
	} catch (error) {
		console.error('Registration error:', error);
		return { success: false, error };
	}
}

export async function fetchUserData() {
	try {
		const username = Cookies.getCookie("username");
		if (!username) {
			throw new Error("Username not found in cookies");
		}

		return await API.fetchWithAuth(`${API.API_BASE_URL}/users/profile/${username}/`);
	} catch (error) {
		console.error('Error fetching user data:', error);
		throw error;
	}
}

export async function submitTwoFactorCode(code) {
	try {
		const username = Cookies.getCookie("username");
		if (!username) {
			throw new Error("Username not found in cookies");
		}
		const data = await API.fetchWithAuth(`${API.API_BASE_URL}/users/2fa/confirm/`, {
			method: 'POST',
			body: JSON.stringify({ 'otp': code }),
		});
		return {success: true, data}
	} catch (error) {
		Notification.showErrorNotification(["Wrong Code", "Please try again later"]);
		return {success: false, error}
	}
}

export async function enableTwoFactorAuth() {
	try {
		const username = Cookies.getCookie("username");
		if (!username) {
			throw new Error("User ID not found in cookies");
		}
		await API.fetchWithAuth(`${API.API_BASE_URL}/users/2fa/setup/`, {
			method: 'GET',
			// body: JSON.stringify(updatedData)
		});
	} catch (error) {
		Notification.showErrorNotification(["Failed to enable 2FA", "Please try again later"]);
		throw error;
	}
}

export async function updateUserData(updatedData) {
	try {
		const username = Cookies.getCookie("username");
		if (!username) {
			throw new Error("User ID not found in cookies");
		}
		await API.fetchWithAuth(`${API.API_BASE_URL}/users/profile/${username}/update/`, {
			method: 'PATCH',
			body: JSON.stringify(updatedData)
		});
		const newUserData = await fetchUserData();
		Notification.showNotification(["Profile updated successfully"]);
		return newUserData;
	} catch (error) {
		Notification.showErrorNotification(["Failed to update profile", "Please try again later"]);
		throw error;
	}
}

export async function deleteUserAccount() {
	try {
		const username = Cookies.getCookie("username");
		if (!username) {
			throw new Error("Username not found in cookies");
		}
		await API.fetchWithAuth(`${API.API_BASE_URL}/users/profile/${username}/delete/`, {
			method: 'DELETE'
		});
		Cookies.deleteAllCookies();
		Notification.showNotification(["Account deleted successfully"]);
	} catch (error) {
		console.error('Error deleting user account:', error);
		Notification.showErrorNotification(["Failed to delete account", "Please try again later"]);
		throw error;
	}
}