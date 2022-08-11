import React from 'react';
import Keys from './../keys.json';
import Mod from './../Mod'

const vendorHash = 672118013;

class Banshee44 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modHashList: []
		};
	}

	componentDidMount() {
		this.fetchVendorItems();
	}

	fetchVendorItems() {
		const mID = window.localStorage.getItem("destinyMembershipID");
		const mType = window.localStorage.getItem("destinyMembershipType");
		const cID = window.localStorage.getItem("characterID");

		if(mID === null || mType === null || cID === null) {
			console.log("Error: Reached vendorFetch missing membershipInfo or characterID");
			return
		} else {
			const headers = new Headers();
			headers.append("x-api-key", Keys.apiKey);
			headers.append("Authorization", "Bearer " + window.localStorage.getItem('accessToken'));
		
			const reqURL = "https://www.bungie.net/Platform/Destiny2/" + mType + "/Profile/" + mID + "/Character/" + cID + "/Vendors/" + vendorHash + "/?components=402"
		
			fetch(reqURL, {
				method: 'GET',
				headers: headers,
			}).then(this.handleErrors)
			.then(response => response.json())
			.then(result => {
				console.log("Banshee-44 Results");
				console.log(result);
				const data = result.Response.sales.data;
				const modsList = [];
                for (let i = 1; i < 5; i++) {
                    modsList.push(data[Object.keys(data)[i]].itemHash);
                }
                this.setState({ modHashList: modsList });
			})
			.catch(error => console.log("Error ", error));
		}
	}

	render() {
		let mods = [];
		for (var i = 0; i < this.state.modHashList.length; i++) {
			mods.push(<div><Mod modHash={this.state.modHashList[i]} key={i}/></div>)
		}
		return (
			<div>
				<h2>Banshee-44:</h2>
				{mods}
			</div>
		);
	}
}

export default Banshee44;