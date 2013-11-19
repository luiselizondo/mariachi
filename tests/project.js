var should = require("should")
	, config = require("./config")
	, Drupal6 = require("../lib/drupal6");

describe("Drupal6", function() {
	it("Should create a database, create the user, assign permissions, flush privileges and drop the database", function(done) {
		this.timeout(60000);
		var data = config;
		var project = new Drupal6(data);

		console.log("MySQLcreateDatabase");
		project.MySQLcreateDatabase(function(err, stdout, stderr) {
			console.log(err);
			console.log(stdout);
			console.log(stderr);
			
			should.not.exist(stderr);

			console.log("MySQLcreateUser");
			project.MySQLcreateUser(function(err, stdout, stderr) {
				should.not.exist(stderr);

				console.log("MySQLassignPermissions");
				project.MySQLassignPermissions(function(err, stdout, stderr) {
					should.not.exist(stderr);

					console.log("MySQLflushPrivileges");
					project.MySQLflushPrivileges(function(err, stdout, stderr) {
						should.not.exist(stderr);

						done();
					})
				});
			});
		});

		after(function(done) {
			console.log("MySQLdropDatabase");
			project.MySQLdropDatabase(function(err, stdout, stderr) {
				should.not.exist(stderr);

				console.log("MySQLdropUser");
				project.MySQLdropUser(function(err, stdout, stderr) {
					should.not.exist(stderr);
					done();
				})
			})
		});
	});

	it("Should create the directory webserver", function(done) {
		this.timeout(60000);
		var data = config;

		var project = new Drupal6(data);
		project.createDirectoryWebServer(function(err, stdout, stderr) {
			console.log(err);
			should.not.exist(stderr);
			done();
		});
	})

	it("Should create the logs directory", function(done) {
		this.timeout(60000);
		var data = config;

		var project = new Drupal6(data);
		project.createLogsDirectory(function(err, stdout, stderr) {
			console.log(err);
			should.not.exist(stderr);
			done();
		});
	})

	// Works
	it("Should clone the codeArchive git project", function(done) {
		this.timeout(320000);
		var data = config;

		var project = new Drupal6(data);
		project.cloneProject(function(err, stdout, stderr) {
			console.log(err);
			should.not.exist(stderr);
			done();
		});
	});

	// Works
	it("Should clone the databaseArchive git project", function(done) {
		this.timeout(320000);
		var data = config;

		var project = new Drupal6(data);
		project.cloneDatabase(function(err, stdout, stderr) {
			console.log(err);
			should.not.exist(stderr);
			done();
		});
	});

	it("Should create a database, create the user, assign permissions, flush privileges and drop the database, extract the database and import", function(done) {
		this.timeout(900000);
		var data = config;

		var project = new Drupal6(data);
		project.MySQLcreateDatabase(function(err, stdout, stderr) {
			should.not.exist(stderr);

			project.MySQLcreateUser(function(err, stdout, stderr) {
				should.not.exist(stderr);

				project.MySQLassignPermissions(function(err, stdout, stderr) {
					should.not.exist(stderr);

					project.MySQLflushPrivileges(function(err, stdout, stderr) {
						should.not.exist(stderr);

						project.cloneDatabase(function(err, stdout, stderr) {
							should.not.exist(stderr);

							project.MySQLextractDatabaseAndImport(function(err, stdout, stderr) {
								should.not.exist(stderr);
								done();
							})
						});
					})
				});
			});
		});

		after(function(done) {
			project.MySQLdropDatabase(function(err, stdout, stderr) {
				should.not.exist(stderr);

				project.MySQLdropUser(function(err, stdout, stderr) {
					should.not.exist(stderr);
					done();
				})
			})
		});
	});

	
	// Works
	it("Should create the virtualhost, enable it and restart apache", function(done) {
		this.timeout(300000);
		var data = config;

		var project = new Drupal6(data);
		project.createVirtualHost(function(err, stdout, stderr) {
			console.log(err);
			should.not.exist(stderr);

			project.enableVirtualHost(function(err, stdout, stderr) {
				console.log(err);
				should.not.exist(stderr);

				project.enableRewriteModule(function(err, stdout, stderr) {
					console.log("Enabling rewrite module");
					console.log(err);
					console.log(stdout);
					console.log(stderr);
					
					project.restartApache(function(err, stdout, stderr) {
						console.log(err);
						should.not.exist(stderr);
						done();
					})
				});
			});
		});
	});
});