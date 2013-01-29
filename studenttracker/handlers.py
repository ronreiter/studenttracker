from mongoengine.queryset import DoesNotExist
from studenttracker.decorators import user_required
from studenttracker.models import *
from studenttracker.config import *
import tornado.web
from tornado import template
import hashlib

def hash_password(password):
	"""hashes passwords with a salt for saving to the DB and comparing."""
	return hashlib.md5(password + COOKIE_SECRET).hexdigest()


class MainHandler(tornado.web.RequestHandler):
	@user_required
	def get(self):
		loader = template.Loader("templates")

		self.write(loader.load("index.html").generate(logo=SITE_LOGO, title=SITE_TITLE, tweets = Tweet.objects, user=self.user))

class LoginHandler(tornado.web.RequestHandler):
	def get(self):
		error = self.get_argument("error", None)

		loader = template.Loader("templates")
		self.write(loader.load("login.html").generate(logo=SITE_LOGO, title=SITE_TITLE, tweets = Tweet.objects, error = error))

	def post(self):
		try:
			user = User.objects.get(
				username = self.get_argument("username"),
				password = hash_password(self.get_argument("password"))
			)
		except DoesNotExist:
			self.redirect("/login?error=wrong-username-password")
			return

		self.set_secure_cookie("user_id", unicode(user.id))
		self.redirect("/")

class RegisterHandler(tornado.web.RequestHandler):
	def get(self):
		error = self.get_argument("error", None)
		loader = template.Loader("templates")
		self.write(loader.load("register.html").generate(logo=SITE_LOGO, title=SITE_TITLE, tweets = Tweet.objects, error = error))

	def post(self):
		if self.get_argument("admin-password") != ADMIN_PASSWORD:
			self.redirect("/register?error=wrong-admin-password")
			return

		if self.get_argument("password") != self.get_argument("confirm"):
			self.redirect("/register?error=password-not-confirmed")
			return

		if User.objects.filter(username = self.get_argument("username")).count() > 0:
			self.redirect("/register?error=user-exists")
			# if username already exists then delete it. mwahahaha
			# User.objects.get(username = self.get_argument("username")).delete()

			return

		new_user = User(
			username = self.get_argument("username"),
			password = hash_password(self.get_argument("password")),
			year = int(self.get_argument("year"))
		)

		new_user.save()
		self.set_secure_cookie("user_id", unicode(new_user.id))
		self.redirect("/")

class LogoutHandler(tornado.web.RequestHandler):
	def get(self):
		self.clear_cookie("user_id")
		self.redirect("/login")
