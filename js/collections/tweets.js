define(["jquery", "underscore", "backbone", "models/tweet"], function($, _, Backbone, Tweet) {
	return Backbone.Collection.extend({
		url: "/tweets",
		model: Tweet,
		getOrderedTweets: function() {
			return _.sortBy(this.models, function(tweet) { return -tweet.get("created") });
		},

		fetchFirst: function() {
			this.page = 0;
			this.fetch({
				data: {
					page: this.page
				}
			})
		},
		fetchNext: function() {
			this.page += 1;
			this.fetch({
				data: {
					page: this.page
				},
				update: true
			});
		}
	});
});