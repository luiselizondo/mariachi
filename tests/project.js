var should = require("should")
	, config = require("./config")
	, Drupal6 = require("../lib/drupal6");

describe("Drupal6", function() {
	it("Should create a database and drop it", function(done) {
		this.timeout(15000);
		var data = config;

		var project = new Drupal6(data);
		project.createDatabase(function(err, stdout, stderr) {
			should.not.exist(err);
			should.not.exist(stderr);
			done();
		});

		after(function(done) {
			project.dropDatabase(function(err, stdout, stderr) {
				should.not.exist(err);
				should.not.exist(stderr);
				done();
			})
		});
	});

	// it("Should drop a database", function(done) {
	// 	var data = config;

	// 	var project = new Drupal6(data);
	// 	before(function(done) {
	// 		project.createDatabase(function(err, stdout, stderr) {
	// 			done();
	// 		})
	// 	});

	// 	project.dropDatabase(function(err, stdout, stderr) {
	// 		should.strictEqual(undefined, err);
	// 		should.strictEqual(undefined, stderr);
	// 		done();
	// 	});
	// });
});