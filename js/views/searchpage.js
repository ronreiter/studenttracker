define(["jquery", "underscore", "backbone", "handlebars", "text!templates/search_results_page.html", "collections/tweets", "views/tweet"], function($, _, Backbone, Handlebars, searchResultsTemplate, TweetsCollection, TweetView) {

	return Backbone.View.extend({
		template: Handlebars.compile(searchResultsTemplate),
		events: {

		},
		initialize: function(options) {
			_.bindAll(this, "scroll");

			this.tweets = new TweetsCollection();
			this.tweets.bind("reset", this.renderAllTweets, this);
			this.tweets.bind("add", this.renderOneTweet, this);

			$(window).bind("scroll", this.scroll);

			// do we really need that?
			this.options = options;
			this.refetch();

		},
		render: function() {
			this.$el.html(this.template());
			this.$tweetsDiv = this.$el.find(".search-results");
			return this;
		},
		refetch: function() {
			var options = this.options;

			if (options.query) {
				this.tweets.fetchFirst({
					q : options.query,
					start : options.start,
					end : options.end
				});
			} else if (options.lesson) {
				this.tweets.fetchFirst({
					lesson : options.lesson
                });
			} else if (options.subject) {
				this.tweets.fetchFirst({
					subject : options.subject
				});
			} else if (options.start && options.end) { //filter by date only
                this.tweets.fetchFirst({
                    start : options.start,
                    end : options.end
                });
            }
		},
		renderAllTweets: function() {
			this.fetching = false;

			if (app.students.length == 0) {
				return;
			}

			this.$tweetsDiv.empty();
			this.tweets.each(_.bind(this.renderOneTweet, this));
		},
		renderOneTweet: function(tweet) {
			this.fetching = false;

			var tweetView = new TweetView({ model: tweet, collection: this.tweets });
			this.$tweetsDiv.append(tweetView.$el);
			tweetView.render();
		},
		close: function() {
			this.tweets.unbind("reset", this.renderAllTweets);
			this.tweets.unbind("add", this.renderOneTweet);

			$(window).unbind("scroll");
		},
		scroll : function() {
			if (!this.fetching && $(document.body).height() - ($(window).scrollTop()+$(window).height())<0) {
				console.log("scroll");
				this.fetching = true;
				this.tweets.fetchNext();
			}
		}

	});
});