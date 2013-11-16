var should = require("should")
	, Drupal6 = require("../lib/drupal6");

describe("Drupal6", function() {
	it("should return an object", function(done) {



		var project = new Drupal6(data);
		project.cloneProject(function(err, stdout, stderr) {
			console.log(err);
			console.log(stdout);
			console.log(stderr);
			
			should.strictEqual(undefined, stderr);
			done();
		});
		
	});
});