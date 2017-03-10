"use strict";

const AWS = require("aws-sdk");
const util = require("util");

const strings = require("./strings");

module.exports = function(grunt) {

	let cleanupApi = function(target) {
		grunt.log.writeln(util.format(strings.INFO_CLEANUP_START, target.restApiId));
		const apigateway = new AWS.APIGateway();
		const params = [apigateway, target.restApiId, target.validStages];

		return new Promise((resolve, reject) => {
			cleanupStages(params[0], params[1], params[2])
			.then(() => {
				cleanupDeployments(params[0], params[1], params[2])
				.then(() => {
					grunt.log.ok(util.format(strings.INFO_CLEANUP_COMPLETE, target.restApiId))
					resolve();
				});
			})
			.catch(reject);
		});
	};

	let cleanupStages = function(apigateway, restApiId, validStages) {
		let params = {
			restApiId: restApiId
		};

		grunt.log.writeln(util.format(strings.INFO_RETRIEVING_STAGES, restApiId));	

		return new Promise((resolve, reject) => {
			apigateway.getStages(params).promise()
			.then((resp) => {
				let orphanedStages = resp.item.filter(stage => validStages.indexOf(stage.stageName) === -1);
				grunt.log.writeln(strings.INFO_DELETING_STAGES);
				Promise.all(orphanedStages.map((stage) => {
					let params = {
						restApiId: restApiId,
						stageName: stage.stageName
					};
					return apigateway.deleteStage(params).promise();
				}))
				.then(() => {
					grunt.log.ok(strings.INFO_STAGES_DELETED);
					resolve();
				});
			})
			.catch(reject);
		});
	};

	let cleanupDeployments = function(apigateway, restApiId, validStages) {
		let params = {
			restApiId: restApiId
		};

		grunt.log.writeln(util.format(strings.INFO_RETRIEVING_DEPLOYMENTS, restApiId));	

		return new Promise((resolve, reject) => {
			apigateway.getStages(params).promise()
			.then((resp) => {
				let remainingDeploymentIds = resp.item.map(stage => stage.deploymentId);

				apigateway.getDeployments(params).promise()
				.then((resp) => {
					grunt.log.writeln(strings.INFO_DELETING_DEPLOYMENTS);
					let orphanedDeployments = resp.items.filter((deployment) => {
						return remainingDeploymentIds.indexOf(deployment.id) === -1;
					});
					Promise.all(orphanedDeployments.map((deployment) => {
						let params = {
							restApiId: restApiId,
							deploymentId: deployment.id
						};
						return apigateway.deleteDeployment(params).promise();
					}))
					.then(() => {
						grunt.log.ok(strings.INFO_DEPLOYMENTS_DELETED);
						resolve();
					});
				});
			})
			.catch(reject);
		});
	};


	grunt.registerMultiTask("cleanup_api", "Removes obsolete stages and any orphaned deployments.", function() {
		if (this.options) {
			AWS.config.update(this.options);
		}

		if (!this.data.validStages) {
			grunt.fatal("Undefined list of valid stages.");
		}

		let done = this.async();
		cleanupApi(this.data)
		.then(() => {
			grunt.log.ok();
			done();
		})
		.catch(grunt.fatal);
	});
};