import React from 'react';

class Vendor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.fetchVendorItems();
	}

	fetchVendorItems() {
		
	}

	render() {
		return (
			<div>
				<h2>{this.props.vendorInfo.vendorHash} - {this.props.vendorInfo.vendorName}</h2>
			</div>
		);
	}
}

export default Vendor;