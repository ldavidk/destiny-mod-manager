import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Keys from './keys.json';

const url = "https://www.bungie.net/platform/Destiny/Manifest/InventoryItem/1274330687/";

class Vendor extends React.Component {

}

class ModPreview extends React.Component {

}

class AuthDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	constructLink() {
		const linkStr = Keys.authURL+"?client_id="+Keys.oauthClientID+"&response_type=code";
		console.log("constructed link: %s", linkStr);
		return linkStr;
	}

	render() {
		return (
			<div>
				<h2>Click here to Authorize with Bungie before retreiving mod info :D</h2>
				<a href={this.constructLink()}>Authorize</a>
			</div>
		);
	}
}

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
		this.fetchData();
		this.checkForAuth()
	}

	checkForAuth() {
		let authCode = undefined;
		if(window.location.href.includes("code=")) {
			this.setState({isAuthenticated: true});
			authCode = window.location.href;
			console.log("location href %s", authCode);
			let codeLoc = authCode.indexOf("code=");
			authCode = authCode.substring(codeLoc + 5)
			console.log("extracted code %s", authCode)
			this.setState({ authCode: authCode });
		}
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

	render() {
		return (
			<div>
				<div>
					<h1>{this.state.apiResults}!</h1>
				</div>
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