define(["jquery", "underscore", "backbone", "models/tweet"], function($, _, Backbone, Tweet) {
	return Backbone.Collection.extend({
		url: "/tweets",
		model: Tweet,
		getOrderedTweets: function() {
			return _.sortBy(this.models, function(tweet) { return -tweet.get("created") });
		},

		fetchFirst: function(options) {
			this.fetchOptions = options ? options : {};
			this.page = 0;

			this.fetchOptions.page = this.page;

			this.fetch({
				data : this.fetchOptions
			});
		},
		fetchNext: function() {
			this.page += 1;

			this.fetchOptions.page = this.page;


			this.fetch({
				data: this.fetchOptions,
				update: true
			});
		}
	});
});