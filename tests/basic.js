var should = require("should");

describe("Basic", function() {
	it("should test basic stuff", function(done) {
		var item = {
			id: 1,
			value: "value"
		}

		item.should.have.property("id", 1);
		item.should.have.property("value", "value");
		done();
	});
});