require.config({
	baseUrl: "/js",
	paths: {
		jquery: "libs/jquery/jquery-min",
		underscore: "libs/underscore/underscore",
		backbone: "libs/backbone/backbone",
		text: "libs/require/text",
		sockjs: "libs/sockjs-0.3",
		handlebars: "libs/handlebars/handlebars"
	}
});

require(["views/app", "backbone", "router"], function(AppView, Backbone, AppRouter) {

	window.router = new AppRouter();
	window.app = new AppView();
	window.app.render();

	Backbone.history.start({pushState: true});


});