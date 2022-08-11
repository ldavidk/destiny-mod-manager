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

class SiteContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			apiResults: "",
			authCode: "",
			isAuthenticated: false,
			username: "",
			emblemPath: ""
		};
	}

	componentDidMount() {
		//this.fetchData(); //Sanity public fetch
		this.checkForAuth();
		this.refreshToken();
		this.getMembershipInfo();
		this.getCharacterInfo();
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
			this.getMemberships();
		})
		.catch(error => console.log("Error ", error));
	}

	getMembershipInfo() {
		const headers = new Headers();
		headers.append("x-api-key", Keys.apiKey);
		headers.append("Authorization", "Bearer " + window.localStorage.getItem('accessToken'));

		const reqURL = "https://www.bungie.net/Platform/User/GetMembershipsById/"+ window.localStorage.getItem('bngMembershipID') +"/254/"

		fetch(reqURL, {
			method: 'GET',
			headers: headers,
		}).then(this.handleErrors)
		.then(response => response.json())
		.then(result => {
			console.log("Get Membership Result:");
			console.log(result);
			this.setState({ username: result.Response.bungieNetUser.uniqueName })
			const primaryMembershipID = result.Response.primaryMembershipId;
			console.log(primaryMembershipID)
			let mID, mType = "";
			result.Response.destinyMemberships.forEach(membership => {
				if(membership.membershipId === primaryMembershipID) {
					mID = primaryMembershipID;
					mType = membership.membershipType;
				}
			});
			if (mID !== "" && mType !== "") 
			{
				window.localStorage.setItem('destinyMembershipID', mID);
				window.localStorage.setItem('destinyMembershipType', mType);
			} else 
			{
				throw Error("Could not find membershipInfo")
			}			
		})
		.catch(error => console.log("Error ", error));
	}

	getCharacterInfo() {
		const mID = window.localStorage.getItem("destinyMembershipID");
		const mType = window.localStorage.getItem("destinyMembershipType");

		if(mID === null || mType === null) {
			console.log("Error: Reached getCharaterInfo missing membershipInfo");
			return
		} else {
			const headers = new Headers();
			headers.append("x-api-key", Keys.apiKey);
			headers.append("Authorization", "Bearer " + window.localStorage.getItem('accessToken'));
		
			const reqURL = "https://www.bungie.net/Platform/Destiny2/" + mType + "/Profile/" + mID + "/?components=200"
		
			fetch(reqURL, {
				method: 'GET',
				headers: headers,
			}).then(this.handleErrors)
			.then(response => response.json())
			.then(result => {
				console.log("GetProfile Result:");
				console.log(result);
				const data = result.Response.characters.data;
				const firstChar = data[Object.keys(data)[0]];
				console.log(firstChar);
				window.localStorage.setItem('characterID', firstChar.characterId);
				this.setState({ emblemPath: "https://www.bungie.net/" + firstChar.emblemBackgroundPath});	
			})
			.catch(error => console.log("Error ", error));
		}
	}

	refreshToken() {
		console.log("Refreshing...");
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
		window.localStorage.setItem('bngMembershipID', result.membership_id);
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
				{/* <div>
					<h1>{this.state.apiResults}!</h1>
				</div> */}
				{this.state.isAuthenticated &&
					<div>
						<div><h1>Hi, {this.state.username}!</h1></div>
						<div>
							<h2>Tada Fuckboy! Is this your card?</h2>
							<img src={this.state.emblemPath} alt="your card, fuckboy"></img>
						</div>
						<div className='vendor-container'>
							{vendors}
						</div>
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