define(["jquery", "underscore", "backbone", "models/tweet"], function($, _, Backbone, Tweet) {
	return Backbone.Collection.extend({
		url: "/tweets",
		model: Tweet,
		getOrderedTweets: function() {
			return _.sortBy(this.models, function(tweet) { return -tweet.get("created") });
		}
	});
});