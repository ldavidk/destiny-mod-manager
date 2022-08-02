import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Keys from './keys.json';

const url = "https://www.bungie.net/platform/Destiny/Manifest/InventoryItem/1274330687/";

class Vendor extends React.Component {
	
}

class ModPreview extends React.Component {

}

class SiteContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			apiResults: "",
		};
	}

	componentDidMount() {
		this.fetchData();
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
			this.setState({apiResults: result.Response.data.inventoryItem.itemName})
			
		})
		.catch(error => console.log('error', error));
	}

	render() {
		return (
			<div>
				<h1>{this.state.apiResults}!</h1>
			</div>
		);
	}
}

// ========================================a

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SiteContainer />);