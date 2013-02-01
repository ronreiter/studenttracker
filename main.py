import tornado.web, tornado.ioloop
from sockjs.tornado import SockJSRouter, SockJSConnection
from tornado.options import define, options

from mongoengine import *

from studenttracker.config import *

from studenttracker.handlers import *
from studenttracker.rest.lessons import *
from studenttracker.rest.subjects import *
from studenttracker.rest.students import *
from studenttracker.rest.tweets import *
from studenttracker.rest.user import *

define("port", default=APP_PORT, help="The port to listen on")

# connect to mongodb (for mongoengine)
connect(DB_NAME)

# the client set to use for notifying clients when something changed using sockjs
clients = set()

class EchoConnection(SockJSConnection):
    def on_open(self, info):
        #self.session = get_session(info.cookies["session"].value)
        #print "client connected: %s" % self.session["user_id"]
        clients.add(self)

    def on_message(self, msg):
        print "received message %s" % msg
        self.send(msg)

    def on_close(self):
        clients.remove(self)


if __name__ == "__main__":
    EchoRouter = SockJSRouter(EchoConnection, '/echo')

    application = tornado.web.Application([
        # static directories
        (r'/css/(.*)', tornado.web.StaticFileHandler, {'path': "css"}),
        (r'/js/(.*)', tornado.web.StaticFileHandler, {'path': "js"}),
        (r'/img/(.*)', tornado.web.StaticFileHandler, {'path': "img"}),

        # main page and other client pages
        (r'/', MainHandler),
        (r'/search', MainHandler),
        (r'/search/.*', MainHandler),
        (r'/tags/.+', MainHandler),
        (r'/student/\w+', MainHandler),
        (r'/lesson/\w+', MainHandler),
        (r'/subject/\w+', MainHandler),

        # user pages
        (r'/login', LoginHandler),
        (r'/logout', LogoutHandler),
        (r'/register', RegisterHandler),

        # REST endpoints
        # ##############

        # user model
        (r'/user', UserHandler),

        # tweets collection and model
        (r'/tweets', TweetsHandler),
        (r'/tweets/(\w+)', TweetHandler),

        # tweets collection and model
        (r'/subjects', SubjectsHandler),
        (r'/subjects/(\w+)', SubjectHandler),

        # tweets collection and model
        (r'/lessons', LessonsHandler),
        (r'/lessons/(\w+)', LessonHandler),

        # students collection and model
        (r'/students', StudentsHandler),
        (r'/students/(\w+)', StudentHandler),
        #(r'/students/(\w+)/image', StudentImageHandler),
        ] + EchoRouter.urls, debug=True, static_path = "static", cookie_secret=COOKIE_SECRET)

    options.parse_command_line()
    print 'Listening on port %s' % options.port
    application.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
