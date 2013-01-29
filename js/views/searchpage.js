define(["jquery", "underscore", "backbone", "handlebars", "text!templates/search_results_page.html", "collections/tweets", "views/tweet"], function($, _, Backbone, Handlebars, searchResultsTemplate, TweetsCollection, TweetView) {

	return Backbone.View.extend({
		template: Handlebars.compile(searchResultsTemplate),
		events: {

		},
		initialize: function(options) {
			this.tweets = new TweetsCollection();
			this.tweets.bind("reset", this.renderAllTweets, this);
			this.tweets.bind("add", this.renderAllTweets, this);

			// do we really need that?
			this.options = options;
			this.refetch();

		},
		render: function() {
			this.$el.html(this.template());
			this.$searchResults = this.$el.find(".search-results");
			return this;
		},
		refetch: function() {
			var options = this.options;

			if (options.query) {
				this.tweets.fetch({ url: "/tweets?" + $.param({
					q : options.query,
					start : options.start,
					end : options.end
				})});
			} else if (options.lesson) {
				this.tweets.fetch({ url: "/tweets?" + $.param({
					lesson : options.lesson
				})
                });
			} else if (options.subject) {
				this.tweets.fetch({ url: "/tweets?" + $.param({
					subject : options.subject
				})});
			} else if (options.start && options.end) { //filter by date only
                this.tweets.fetch({ url: "/tweets?" + $.param({
                    start : options.start,
                    end : options.end
                })
                });
            }
		},
		renderTweets: function(container, tweets) {
			container.empty();
			_.each(tweets.getOrderedTweets(), _.bind(function(tweet) {
				var tweetView = new TweetView({ model: tweet });
				container.prepend(tweetView.$el);
				tweetView.render();
			}, this));
		},
		renderAllTweets: function() {
			this.renderTweets(this.$searchResults, this.tweets);
		},
		close: function() {
			this.tweets.unbind("reset", this.renderAllTweets);
			this.tweets.unbind("add", this.renderAllTweets);
		}
	});
});