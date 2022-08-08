import React from 'react';
import Keys from './keys.json'

class AuthDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	constructLink() {
		const linkStr = Keys.authURL+"?client_id="+Keys.oauthClientID+"&response_type=code";
		// console.log("constructed link: %s", linkStr);
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

export default AuthDialog;