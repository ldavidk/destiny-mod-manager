import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Keys from './keys.json';
import Vendors from './hashes.json'
import AuthDialog from './authDialog.jsx'
import Vendor from './vendor'

const url = "https://www.bungie.net/platform/Destiny/Manifest/InventoryItem/1274330687/";

class ModPreview extends React.Component {

}

// class AuthDialog extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {};
// 	}

// 	constructLink() {
// 		const linkStr = Keys.authURL+"?client_id="+Keys.oauthClientID+"&response_type=code";
// 		// console.log("constructed link: %s", linkStr);
// 		return linkStr;
// 	}

// 	render() {
// 		return (
// 			<div>
// 				<h2>Click here to Authorize with Bungie before retreiving mod info :D</h2>
// 				<a href={this.constructLink()}>Authorize</a>
// 			</div>
// 		);
// 	}
// }

class SiteContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			apiResults: "",
			authCode: "",
			isAuthenticated: false
		};
	}

	componentDidMount() {
		this.fetchData(); //Sanity public fetch
		this.checkForAuth();
		// window.localStorage.clear();
		// this.queryVendors();
	}

	checkForAuth() {
		let isAuth = (window.localStorage.getItem('isAuthenticated') === 'true');
		this.setState({isAuthenticated: isAuth});
		console.log(isAuth);
		let accessTimestamp = parseInt(window.localStorage.getItem('accessTokenTimestamp'));
		if (accessTimestamp > Date.now() + 3000) {
			this.refreshToken()
		} else {
			if(!isAuth) {
				if(window.location.href.includes("code=")) {
					let authCode = window.location.href;
					// console.log("location href %s", authCode);
					let codeLoc = authCode.indexOf("code=");
					authCode = authCode.substring(codeLoc + 5)
					console.log("extracted code %s", authCode)
					this.setState({ authCode: authCode });
					this.fetchAuthToken(authCode)
				}
			}
		}
	}

	fetchAuthToken(authCode) {
		let tokenHeaders = new Headers();
		var X = window.btoa(`${Keys.oauthClientID}:${Keys.oauthClientSecret}`)
		tokenHeaders.append("x-api-key", Keys.apiKey);
		tokenHeaders.append("Content-Type", 'application/x-www-form-urlencoded');
		tokenHeaders.append("Authorization", "Basic " + X);

		// console.log(X);
		// console.log("AuthCode: %s", authCode)

		fetch(Keys.tokenURL, {
			method: 'POST',
			headers: tokenHeaders,
			body: new URLSearchParams({
				'client_id': Keys.oauthClientID,
				'grant_type': 'authorization_code',
				'code': authCode
			}).toString()
		}).then(this.handleErrors)
		.then(response => response.json())
		.then(result => {
			console.log("Token Fetch Result:");
			console.log(result);
			this.storeAuthParams(result);
			window.location.replace("/")
		})
		.catch(error => console.log("Error ", error));
	}

	refreshToken() {
		let refreshHeaders = new Headers();
		var X = window.btoa(`${Keys.oauthClientID}:${Keys.oauthClientSecret}`)
		refreshHeaders.append("x-api-key", Keys.apiKey);
		refreshHeaders.append("Content-Type", 'application/x-www-form-urlencoded');
		refreshHeaders.append("Authorization", "Basic " + X)

		let refreshToken = window.localStorage.getItem('refreshToken') 

		fetch(Keys.tokenURL, {
			method: 'POST',
			headers: refreshHeaders,
			body: new URLSearchParams({
				'grant_type': 'refresh_token',
				'refresh_token': refreshToken
			}).toString()
		}).then(this.handleErrors)
		.then(response => response.json())
		.then(result => {
			console.log("Refresh Results:");
			console.log(result);
			this.storeAuthParams(result);
		})
		.catch(error => console.log("Error ", error));
	}

	storeAuthParams(result) {
		window.localStorage.setItem('accessToken', result.access_token);
		window.localStorage.setItem('accessTokenTimestamp', Date.now());
		window.localStorage.setItem('refreshToken', result.refresh_token);
		window.localStorage.setItem('isAuthenticated', true);
	}

	handleErrors(response) { //TODO make me actually work
		if (!response.ok) {
			throw Error(response.statusText);
		}
		return response;
	}

	fetchData() {
		var myHeaders = new Headers();
		myHeaders.append("x-api-key", Keys.apiKey);

		var requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow'
		};

		fetch(url, requestOptions)
			.then(response => response.json())
			.then(result => {
				console.log(result)
				this.setState({ apiResults: result.Response.data.inventoryItem.itemName })

			})
			.catch(error => console.log('error', error));
	}

	getVendors() {
		const vendorList = Vendors.Vendors;
		return vendorList;
	}

	render() {
		let vendorList = this.getVendors();
		let vendors = [];
		for (var i = 0; i < vendorList.length; i++) {
			vendors.push(<Vendor vendorInfo={vendorList[i]} key={i}/>)
		}
		return (
			<div>
				<div>
					<h1>{this.state.apiResults}!</h1>
				</div>
				{this.state.isAuthenticated &&
					<div className='vendor-container'>
					{vendors}
				</div>
				}
				{!this.state.isAuthenticated && 
					<div>
						<AuthDialog></AuthDialog>
					</div>
				}
			</div>
		);
	}
}

// ========================================a

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SiteContainer />);