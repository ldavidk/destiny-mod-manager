import React from 'react';

class Mod extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
		};
	}

    render() {
		return (
			<div>
				<h3>{this.props.modHash}</h3>
			</div>
		);
	}
}

export default Mod