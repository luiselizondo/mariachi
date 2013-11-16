function Actions() {

}

module.exports = Actions;

Actions.prototype.refreshStatus = function(req, res) {
	console.log("Here we check the status");
	var result = {
		data: "All OK"
	}

	res.send(200, result);
}

